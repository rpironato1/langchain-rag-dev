"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wrench, Play, FileText, Globe, FolderOpen } from "lucide-react";
import { toast } from "sonner";

interface MCPTool {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

interface ToolResult {
  tool: string;
  parameters: any;
  result: any;
  error?: string;
  timestamp: string;
}

export default function MCPToolsPage() {
  const [tools, setTools] = useState<MCPTool[]>([]);
  const [selectedTool, setSelectedTool] = useState<MCPTool | null>(null);
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [results, setResults] = useState<ToolResult[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    loadTools();
  }, []);

  const loadTools = async () => {
    try {
      const response = await fetch("/api/mcp");
      const data = await response.json();
      setTools(data.tools || []);
    } catch (error) {
      toast.error("Failed to load MCP tools");
    }
  };

  const executeTool = async () => {
    if (!selectedTool) return;

    setIsExecuting(true);
    
    try {
      const response = await fetch("/api/mcp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tool: selectedTool.name,
          parameters,
        }),
      });

      const result = await response.json();
      
      setResults(prev => [result, ...prev]);
      
      if (result.error) {
        toast.error(`Tool execution failed: ${result.error}`);
      } else {
        toast.success("Tool executed successfully!");
      }
    } catch (error) {
      toast.error("Error executing tool");
      console.error(error);
    } finally {
      setIsExecuting(false);
    }
  };

  const getToolIcon = (toolName: string) => {
    if (toolName.includes("file") || toolName.includes("read") || toolName.includes("write")) {
      return <FileText className="h-4 w-4" />;
    }
    if (toolName.includes("directory") || toolName.includes("list")) {
      return <FolderOpen className="h-4 w-4" />;
    }
    if (toolName.includes("url") || toolName.includes("fetch")) {
      return <Globe className="h-4 w-4" />;
    }
    return <Wrench className="h-4 w-4" />;
  };

  const renderParameterInput = (paramName: string, paramDef: any) => {
    const value = parameters[paramName] || "";
    
    if (paramDef.type === "string" && paramDef.description?.includes("content")) {
      return (
        <Textarea
          value={value}
          onChange={(e) => setParameters(prev => ({ ...prev, [paramName]: e.target.value }))}
          placeholder={paramDef.description}
          rows={3}
        />
      );
    }
    
    return (
      <Input
        value={value}
        onChange={(e) => setParameters(prev => ({ ...prev, [paramName]: e.target.value }))}
        placeholder={paramDef.description}
        type={paramDef.type === "number" ? "number" : "text"}
      />
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                MCP Tools
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Model Context Protocol tools for file operations and web requests
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tools.map((tool) => (
                  <div
                    key={tool.name}
                    className={`p-3 border rounded-lg cursor-pointer hover:bg-muted/50 ${
                      selectedTool?.name === tool.name ? "bg-muted border-primary" : ""
                    }`}
                    onClick={() => {
                      setSelectedTool(tool);
                      setParameters({});
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {getToolIcon(tool.name)}
                      <code className="text-sm font-mono">{tool.name}</code>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {tool.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedTool && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getToolIcon(selectedTool.name)}
                  {selectedTool.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {selectedTool.description}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedTool.parameters.properties && Object.entries(selectedTool.parameters.properties).map(([paramName, paramDef]: [string, any]) => (
                    <div key={paramName}>
                      <label className="text-sm font-medium mb-1 block">
                        {paramName}
                        {selectedTool.parameters.required?.includes(paramName) && (
                          <span className="text-destructive ml-1">*</span>
                        )}
                      </label>
                      {renderParameterInput(paramName, paramDef)}
                      {paramDef.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {paramDef.description}
                        </p>
                      )}
                    </div>
                  ))}
                  
                  <Button
                    onClick={executeTool}
                    disabled={isExecuting}
                    className="w-full"
                  >
                    {isExecuting ? (
                      <>
                        <Play className="h-4 w-4 mr-2 animate-spin" />
                        Executing...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Execute Tool
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Execution Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {results.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No tool executions yet. Select a tool and execute it to see results.
                  </div>
                ) : (
                  results.map((result, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono">{result.tool}</code>
                          <Badge variant={result.error ? "destructive" : "default"}>
                            {result.error ? "Error" : "Success"}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      {result.parameters && Object.keys(result.parameters).length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Parameters:</p>
                          <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                            {JSON.stringify(result.parameters, null, 2)}
                          </pre>
                        </div>
                      )}
                      
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          {result.error ? "Error:" : "Result:"}
                        </p>
                        <pre className={`text-xs p-2 rounded overflow-x-auto ${
                          result.error ? "bg-destructive/10 text-destructive" : "bg-muted"
                        }`}>
                          {JSON.stringify(result.error || result.result, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}