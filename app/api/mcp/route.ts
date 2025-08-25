import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// MCP Tool Registry
interface MCPTool {
  name: string;
  description: string;
  parameters: Record<string, any>;
  handler: (params: any) => Promise<any>;
}

// File system operations
const fileSystemTools: MCPTool[] = [
  {
    name: "read_file",
    description: "Read contents of a file",
    parameters: {
      type: "object",
      properties: {
        path: { type: "string", description: "Path to the file to read" }
      },
      required: ["path"]
    },
    handler: async (params) => {
      const fs = await import("fs/promises");
      const path = await import("path");
      
      // Security: restrict to project directory
      const safePath = path.resolve(process.cwd(), params.path);
      if (!safePath.startsWith(process.cwd())) {
        throw new Error("Access denied: Path outside project directory");
      }
      
      try {
        const content = await fs.readFile(safePath, "utf-8");
        return { success: true, content, path: params.path };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
  },
  {
    name: "write_file",
    description: "Write content to a file",
    parameters: {
      type: "object",
      properties: {
        path: { type: "string", description: "Path to the file to write" },
        content: { type: "string", description: "Content to write to the file" }
      },
      required: ["path", "content"]
    },
    handler: async (params) => {
      const fs = await import("fs/promises");
      const path = await import("path");
      
      // Security: restrict to project directory
      const safePath = path.resolve(process.cwd(), params.path);
      if (!safePath.startsWith(process.cwd())) {
        throw new Error("Access denied: Path outside project directory");
      }
      
      try {
        await fs.writeFile(safePath, params.content, "utf-8");
        return { success: true, path: params.path, size: params.content.length };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
  },
  {
    name: "list_directory",
    description: "List contents of a directory",
    parameters: {
      type: "object",
      properties: {
        path: { type: "string", description: "Path to the directory to list" }
      },
      required: ["path"]
    },
    handler: async (params) => {
      const fs = await import("fs/promises");
      const path = await import("path");
      
      // Security: restrict to project directory
      const safePath = path.resolve(process.cwd(), params.path);
      if (!safePath.startsWith(process.cwd())) {
        throw new Error("Access denied: Path outside project directory");
      }
      
      try {
        const items = await fs.readdir(safePath, { withFileTypes: true });
        const contents = items.map(item => ({
          name: item.name,
          type: item.isDirectory() ? "directory" : "file",
          path: path.join(params.path, item.name)
        }));
        return { success: true, contents, path: params.path };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
  }
];

// Web and API tools
const webTools: MCPTool[] = [
  {
    name: "fetch_url",
    description: "Fetch content from a URL",
    parameters: {
      type: "object",
      properties: {
        url: { type: "string", description: "URL to fetch" },
        method: { type: "string", enum: ["GET", "POST"], default: "GET" },
        headers: { type: "object", description: "Request headers" },
        body: { type: "string", description: "Request body for POST requests" }
      },
      required: ["url"]
    },
    handler: async (params) => {
      try {
        const response = await fetch(params.url, {
          method: params.method || "GET",
          headers: params.headers,
          body: params.body
        });
        
        const content = await response.text();
        return {
          success: true,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers),
          content
        };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
  }
];

const allTools = [...fileSystemTools, ...webTools];

export async function GET() {
  return NextResponse.json({
    tools: allTools.map(tool => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters
    })),
    description: "MCP (Model Context Protocol) Tools API",
    usage: "POST to /api/mcp with { tool: string, parameters: object }"
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tool: toolName, parameters = {} } = body;
    
    if (!toolName) {
      return NextResponse.json({ error: "Tool name is required" }, { status: 400 });
    }
    
    const tool = allTools.find(t => t.name === toolName);
    if (!tool) {
      return NextResponse.json(
        { error: `Tool '${toolName}' not found` },
        { status: 404 }
      );
    }
    
    try {
      const result = await tool.handler(parameters);
      return NextResponse.json({
        tool: toolName,
        parameters,
        result,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      return NextResponse.json({
        tool: toolName,
        parameters,
        error: error.message,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: "Invalid request body", details: error.message },
      { status: 400 }
    );
  }
}