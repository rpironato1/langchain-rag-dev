"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Copy, Sparkles, Code2, Download, Terminal, Clock } from "lucide-react";
import { toast } from "sonner";

interface GeneratedComponent {
  type: "generated" | "background_task";
  prompt?: string;
  code?: string;
  suggestions?: string[];
  timestamp: string;
  taskId?: string;
  message?: string;
  pollUrl?: string;
  method?: string;
}

interface TaskStatus {
  taskId: string;
  status: string;
  output: string;
  completed: boolean;
}

export default function ReactBitsPage() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedComponent, setGeneratedComponent] = useState<GeneratedComponent | null>(null);
  const [availableComponents, setAvailableComponents] = useState<string[]>([]);
  const [useBackground, setUseBackground] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<TaskStatus | null>(null);

  // Fetch available components on mount
  useEffect(() => {
    fetch("/api/reactbits")
      .then(res => res.json())
      .then(data => {
        if (data.availableComponents) {
          setAvailableComponents(data.availableComponents);
        }
      })
      .catch(error => console.error("Error fetching components:", error));
  }, []);

  // Poll for task status if there's an active background task
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;
    
    if (activeTaskId && isGenerating) {
      pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`/api/reactbits?taskId=${activeTaskId}`);
          const status = await response.json();
          
          setTaskStatus(status);
          
          if (status.completed) {
            setIsGenerating(false);
            setActiveTaskId(null);
            
            if (status.status === 'completed' && status.output) {
              // Convert task output to generated component format
              setGeneratedComponent({
                type: "generated",
                prompt,
                code: status.output,
                timestamp: new Date().toISOString(),
                method: "CLI-generated (background task)",
                suggestions: [
                  "Generated using CLI tools in background",
                  "Add prop validation with PropTypes or Zod",
                  "Consider adding unit tests with Jest and React Testing Library",
                  "Add Storybook stories for component documentation"
                ]
              });
              toast.success("Background component generation completed!");
            } else if (status.status === 'failed') {
              toast.error("Background task failed: " + (status.output || "Unknown error"));
            }
            
            clearInterval(pollInterval);
          }
        } catch (error) {
          console.error("Error polling task status:", error);
          toast.error("Error checking task status");
        }
      }, 2000); // Poll every 2 seconds
    }
    
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [activeTaskId, isGenerating, prompt]);

  const generateComponent = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setGeneratedComponent(null);
    setTaskStatus(null);
    setActiveTaskId(null);
    
    try {
      const response = await fetch("/api/reactbits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          useBackground,
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        if (result.type === "background_task") {
          // Background task started
          setActiveTaskId(result.taskId);
          toast.success("Component generation started in background using CLI tools!");
          // Keep isGenerating true to show polling status
        } else {
          // Synchronous result
          setGeneratedComponent(result);
          setIsGenerating(false);
          toast.success("Component generated successfully using CLI tools!");
        }
      } else {
        toast.error(result.error || "Failed to generate component");
        setIsGenerating(false);
      }
    } catch (error) {
      toast.error("Error generating component");
      console.error(error);
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (generatedComponent && generatedComponent.code) {
      await navigator.clipboard.writeText(generatedComponent.code);
      toast.success("Code copied to clipboard!");
    }
  };

  const downloadFile = () => {
    if (generatedComponent && generatedComponent.code) {
      const blob = new Blob([generatedComponent.code], { type: "text/typescript" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Component.tsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Component downloaded!");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              ReactBits - CLI-Powered Component Generator
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Generate React components using CLI tools (Claude/Gemini) with minimal API usage
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Component Description
                </label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the component you want to generate (e.g., 'A modal dialog with form validation and close button')"
                  rows={3}
                />
              </div>

              {availableComponents.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Available UI Components
                  </label>
                  <p className="text-xs text-muted-foreground mb-2">
                    You can reference these existing components in your prompt:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {availableComponents.map((component) => (
                      <Badge key={component} variant="secondary" className="text-xs">
                        {component}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="background-task" 
                  checked={useBackground}
                  onCheckedChange={(checked) => setUseBackground(checked as boolean)}
                />
                <label htmlFor="background-task" className="text-sm font-medium">
                  Use background task execution (recommended for complex components)
                </label>
              </div>

              {activeTaskId && isGenerating && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-blue-600 animate-pulse" />
                    <span className="text-sm font-medium text-blue-800">
                      Background Task Running
                    </span>
                  </div>
                  <p className="text-xs text-blue-600">
                    Task ID: {activeTaskId}
                  </p>
                  {taskStatus && (
                    <p className="text-xs text-blue-600 mt-1">
                      Status: {taskStatus.status} 
                      {taskStatus.output && ` - ${taskStatus.output.slice(0, 100)}...`}
                    </p>
                  )}
                </div>
              )}

              <Button
                onClick={generateComponent}
                disabled={!prompt.trim() || isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  activeTaskId ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-pulse" />
                      Background Task Running...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                      Starting Generation...
                    </>
                  )
                ) : (
                  <>
                    <Terminal className="h-4 w-4 mr-2" />
                    Generate Component {useBackground ? "(Background)" : "(Sync)"}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {generatedComponent && generatedComponent.code && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Code2 className="h-5 w-5" />
                  Generated Component
                  <Badge variant="default">
                    {generatedComponent.method || "CLI-generated"}
                  </Badge>
                </CardTitle>
                <div className="flex gap-2">
                  <Button onClick={copyToClipboard} variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button onClick={downloadFile} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-black rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-green-400">
                    <code>{generatedComponent.code}</code>
                  </pre>
                </div>

                {generatedComponent.suggestions && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">💡 Suggestions:</h4>
                    <ul className="text-sm space-y-1">
                      {generatedComponent.suggestions.map((suggestion, index) => (
                        <li key={index} className="text-muted-foreground">
                          • {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  Generated: {new Date(generatedComponent.timestamp).toLocaleString()}
                  {generatedComponent.method && (
                    <span className="ml-2">• Method: {generatedComponent.method}</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}