"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Terminal, Play, Trash2 } from "lucide-react";

interface TerminalOutput {
  id: string;
  command: string;
  stdout: string;
  stderr: string;
  success: boolean;
  timestamp: string;
  workingDirectory: string;
}

export default function TerminalPage() {
  const [command, setCommand] = useState("");
  const [outputs, setOutputs] = useState<TerminalOutput[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [workingDirectory, setWorkingDirectory] = useState(process.cwd());
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [outputs]);

  const executeCommand = async () => {
    if (!command.trim() || isExecuting) return;

    setIsExecuting(true);
    
    try {
      const response = await fetch("/api/terminal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          command: command.trim(),
          workingDirectory,
        }),
      });

      const result = await response.json();
      
      const output: TerminalOutput = {
        id: Date.now().toString(),
        command: command.trim(),
        stdout: result.stdout || "",
        stderr: result.stderr || "",
        success: result.success || false,
        timestamp: new Date().toISOString(),
        workingDirectory: result.workingDirectory || workingDirectory,
      };

      setOutputs(prev => [...prev, output]);
      
      // Update working directory if pwd command was used
      if (command.trim() === "pwd" && result.stdout) {
        setWorkingDirectory(result.stdout.trim());
      }
      
      setCommand("");
    } catch (error) {
      const errorOutput: TerminalOutput = {
        id: Date.now().toString(),
        command: command.trim(),
        stdout: "",
        stderr: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false,
        timestamp: new Date().toISOString(),
        workingDirectory,
      };
      
      setOutputs(prev => [...prev, errorOutput]);
    } finally {
      setIsExecuting(false);
    }
  };

  const clearOutputs = () => {
    setOutputs([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      executeCommand();
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              Terminal Interface
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Execute safe terminal commands with security restrictions
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter command (e.g., ls, pwd, npm --version)"
                  disabled={isExecuting}
                  className="font-mono"
                />
                <Button
                  onClick={executeCommand}
                  disabled={!command.trim() || isExecuting}
                  size="icon"
                >
                  <Play className="h-4 w-4" />
                </Button>
                <Button
                  onClick={clearOutputs}
                  variant="outline"
                  size="icon"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground">
                Working Directory: {workingDirectory}
              </div>
              
              <div
                ref={outputRef}
                className="bg-black rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm"
              >
                {outputs.length === 0 ? (
                  <div className="text-gray-500">
                    Terminal ready. Enter a command above.
                  </div>
                ) : (
                  outputs.map((output) => (
                    <div key={output.id} className="mb-4">
                      <div className="text-green-400">
                        $ {output.command}
                      </div>
                      {output.stdout && (
                        <div className="text-white whitespace-pre-wrap">
                          {output.stdout}
                        </div>
                      )}
                      {output.stderr && (
                        <div className="text-red-400 whitespace-pre-wrap">
                          {output.stderr}
                        </div>
                      )}
                      <div className="text-gray-500 text-xs mt-1">
                        {new Date(output.timestamp).toLocaleTimeString()} | 
                        Status: {output.success ? "✅" : "❌"}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Allowed Commands</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              {[
                "ls", "pwd", "echo", "cat", "grep", "find", "wc", "head", "tail",
                "npm", "yarn", "node", "npx", "git",
                "mkdir", "touch", "rm", "cp", "mv"
              ].map((cmd) => (
                <code 
                  key={cmd}
                  className="bg-muted px-2 py-1 rounded cursor-pointer hover:bg-muted/80"
                  onClick={() => setCommand(cmd)}
                >
                  {cmd}
                </code>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Security restrictions: No sudo, no system modifications, 30s timeout
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}