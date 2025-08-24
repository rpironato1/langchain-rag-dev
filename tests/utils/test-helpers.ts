export interface MCPToolResponse {
  tool: string;
  parameters: any;
  result?: any;
  error?: string;
  timestamp: string;
}

export interface MCPTool {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface FileSystemResult {
  success: boolean;
  content?: string;
  path?: string;
  size?: number;
  contents?: Array<{
    name: string;
    type: 'file' | 'directory';
    path: string;
  }>;
  error?: string;
}

export interface WebResult {
  success: boolean;
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
  content?: string;
  error?: string;
}

export class MCPTestClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  async getTools(): Promise<{ tools: MCPTool[] }> {
    const response = await fetch(`${this.baseUrl}/api/mcp`);
    return response.json();
  }

  async executeTool(toolName: string, parameters: any = {}): Promise<MCPToolResponse> {
    const response = await fetch(`${this.baseUrl}/api/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tool: toolName,
        parameters,
      }),
    });
    return response.json();
  }

  async readFile(path: string): Promise<MCPToolResponse> {
    return this.executeTool('read_file', { path });
  }

  async writeFile(path: string, content: string): Promise<MCPToolResponse> {
    return this.executeTool('write_file', { path, content });
  }

  async listDirectory(path: string): Promise<MCPToolResponse> {
    return this.executeTool('list_directory', { path });
  }

  async fetchUrl(url: string, options: any = {}): Promise<MCPToolResponse> {
    return this.executeTool('fetch_url', { url, ...options });
  }
}

export class TestFileManager {
  private testDir: string;

  constructor(testDir: string = './tests/fixtures/test-files') {
    this.testDir = testDir;
  }

  getTestFilePath(filename: string): string {
    return `${this.testDir}/${filename}`;
  }

  async createTestFile(filename: string, content: string): Promise<string> {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const fullPath = path.resolve(this.testDir, filename);
    await fs.writeFile(fullPath, content, 'utf-8');
    return fullPath;
  }

  async cleanupTestFile(filename: string): Promise<void> {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    try {
      const fullPath = path.resolve(this.testDir, filename);
      await fs.unlink(fullPath);
    } catch (error) {
      // Ignore if file doesn't exist
    }
  }

  async ensureTestDir(): Promise<void> {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    try {
      await fs.mkdir(path.resolve(this.testDir), { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  }
}

export function createMockServer(port: number = 3001) {
  const handlers = new Map<string, (req: any) => any>();

  const server = {
    on: (path: string, handler: (req: any) => any) => {
      handlers.set(path, handler);
    },

    start: async () => {
      // Mock server implementation would go here
      // For now, we'll use a simple object to simulate responses
      return Promise.resolve();
    },

    stop: async () => {
      handlers.clear();
      return Promise.resolve();
    },

    getHandler: (path: string) => handlers.get(path),
  };

  return server;
}

export const TEST_TIMEOUTS = {
  SHORT: 5000,
  MEDIUM: 10000,
  LONG: 30000,
} as const;

export const TEST_DATA = {
  SAMPLE_TEXT: 'This is a test file for MCP operations.',
  SAMPLE_JSON: JSON.stringify({ test: true, message: 'Hello from MCP tests' }, null, 2),
  SAMPLE_HTML: '<html><body><h1>Test Page</h1></body></html>',
} as const;

// Helper functions for use within test contexts
// These functions should be called within test blocks where expect is available

export function expectValidMCPResponse(response: MCPToolResponse, toolName: string) {
  // Note: This function assumes it's called within a test context where expect is available
  return {
    checkResponse: () => response,
    checkTool: () => response.tool === toolName,
    checkTimestamp: () => !!response.timestamp && !isNaN(Date.parse(response.timestamp))
  };
}

export function expectSuccessfulResult(response: MCPToolResponse) {
  return {
    hasError: () => !!response.error,
    hasResult: () => !!response.result,
    isSuccess: () => response.result?.success === true
  };
}

export function expectErrorResult(response: MCPToolResponse, expectedError?: string) {
  const error = response.error || response.result?.error;
  return {
    hasError: () => !!error,
    containsExpectedError: () => !expectedError || (error && error.includes(expectedError))
  };
}