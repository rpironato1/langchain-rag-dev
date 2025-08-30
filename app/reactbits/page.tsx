"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Sparkles, Code2, Download } from "lucide-react";
import { toast } from "sonner";

interface GeneratedComponent {
  type: "generated";
  prompt?: string;
  code: string;
  suggestions?: string[];
  timestamp: string;
}

export default function ReactBitsPage() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedComponent, setGeneratedComponent] = useState<GeneratedComponent | null>(null);
  const [availableComponents, setAvailableComponents] = useState<string[]>([]);

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

  const generateComponent = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    
    try {
      const response = await fetch("/api/reactbits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        setGeneratedComponent(result);
        toast.success("Component generated successfully!");
      } else {
        toast.error(result.error || "Failed to generate component");
      }
    } catch (error) {
      toast.error("Error generating component");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (generatedComponent) {
      await navigator.clipboard.writeText(generatedComponent.code);
      toast.success("Code copied to clipboard!");
    }
  };

  const downloadFile = () => {
    if (generatedComponent) {
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
              <Sparkles className="h-5 w-5" />
              ReactBits - Component Generator
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Generate React components with TypeScript, Tailwind CSS, and Shadcn UI patterns
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

              <Button
                onClick={generateComponent}
                disabled={!prompt.trim() || isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                    Generating Component...
                  </>
                ) : (
                  <>
                    <Code2 className="h-4 w-4 mr-2" />
                    Generate Component
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {generatedComponent && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Code2 className="h-5 w-5" />
                  Generated Component
                  <Badge variant="default">
                    generated
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
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}