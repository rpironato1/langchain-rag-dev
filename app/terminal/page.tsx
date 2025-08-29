"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Terminal, Play, Trash2, FolderOpen, Clock, CheckCircle, XCircle, RefreshCw } from "lucide-react";

interface TerminalOutput {
  id: string;
  command: string;
  stdout: string;
  stderr: string;
  success: boolean;
  timestamp: string;
  workingDirectory: string;
  taskId?: string;
  isBackground?: boolean;
}

interface BackgroundTask {
  taskId: string;
  command: string;
  status: 'running' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
}

export default function TerminalPage() {
  const [command, setCommand] = useState("");
  const [outputs, setOutputs] = useState<TerminalOutput[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [workingDirectory, setWorkingDirectory] = useState(process.cwd());
  const [backgroundTasks, setBackgroundTasks] = useState<BackgroundTask[]>([]);
  const [showBackground, setShowBackground] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [outputs]);

  // Poll background tasks
  useEffect(() => {
    const interval = setInterval(async () => {
      if (backgroundTasks.some(t => t.status === 'running')) {
        await fetchBackgroundTasks();
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [backgroundTasks]);

  const fetchBackgroundTasks = async () => {
    try {
      const response = await fetch("/api/terminal?action=list");
      const result = await response.json();
      setBackgroundTasks(result.tasks || []);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await fetch("/api/terminal?action=plans");
      const result = await response.json();
      setPlans(result.plans || []);
    } catch (error) {
      console.error("Failed to fetch plans:", error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/terminal?action=projects");
      const result = await response.json();
      setProjects(result.projects || []);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    }
  };

  const executeCommand = async (backgroundMode = false) => {
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
          background: backgroundMode,
        }),
      });

      const result = await response.json();
      
      const output: TerminalOutput = {
        id: Date.now().toString(),
        command: command.trim(),
        stdout: result.stdout || result.message || "",
        stderr: result.stderr || "",
        success: result.success || false,
        timestamp: new Date().toISOString(),
        workingDirectory: result.workingDirectory || workingDirectory,
        taskId: result.taskId,
        isBackground: backgroundMode,
      };

      setOutputs(prev => [...prev, output]);
      
      if (backgroundMode && result.taskId) {
        await fetchBackgroundTasks();
      }
      
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

  const checkTaskStatus = async (taskId: string) => {
    try {
      const response = await fetch(`/api/terminal?taskId=${taskId}`);
      const result = await response.json();
      
      const output: TerminalOutput = {
        id: Date.now().toString(),
        command: `Task Status: ${taskId}`,
        stdout: `Status: ${result.status}\nOutput: ${result.output || 'No output yet'}`,
        stderr: result.error || "",
        success: result.status === 'completed',
        timestamp: new Date().toISOString(),
        workingDirectory,
        taskId,
      };
      
      setOutputs(prev => [...prev, output]);
    } catch (error) {
      console.error("Failed to check task status:", error);
    }
  };

  const clearOutputs = () => {
    setOutputs([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      executeCommand(false);
    }
  };

  const insertExampleCommand = (cmd: string) => {
    setCommand(cmd);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              Enhanced Terminal Interface with CLI Integration
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Execute commands including Claude and Gemini CLI tools with background task support
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter command (e.g., claude -p 'Create a web app' --dangerously-skip-permissions)"
                  disabled={isExecuting}
                  className="font-mono"
                />
                <Button
                  onClick={() => executeCommand(false)}
                  disabled={!command.trim() || isExecuting}
                  size="icon"
                  title="Execute immediately"
                >
                  <Play className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => executeCommand(true)}
                  disabled={!command.trim() || isExecuting}
                  variant="outline"
                  size="icon"
                  title="Execute in background"
                >
                  <Clock className="h-4 w-4" />
                </Button>
                <Button
                  onClick={clearOutputs}
                  variant="outline"
                  size="icon"
                  title="Clear output"
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
                    Terminal ready. Enter a command above or try the examples below.
                  </div>
                ) : (
                  outputs.map((output) => (
                    <div key={output.id} className="mb-4">
                      <div className="text-green-400 flex items-center gap-2">
                        $ {output.command}
                        {output.isBackground && <Clock className="h-3 w-3" />}
                        {output.taskId && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-4 px-1 text-xs text-blue-400"
                            onClick={() => checkTaskStatus(output.taskId!)}
                          >
                            Check Status
                          </Button>
                        )}
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
                        {output.taskId && ` | Task: ${output.taskId}`}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                CLI Examples
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Claude CLI</h4>
                <div className="space-y-1">
                  {[
                    'claude -p "Create a React app with authentication" --dangerously-skip-permissions',
                    'claude -p "Analyze this codebase for security issues" --dangerously-skip-permissions',
                    'claude -p "Plan a microservices architecture" --dangerously-skip-permissions'
                  ].map((cmd, i) => (
                    <code 
                      key={i}
                      className="block bg-muted px-2 py-1 rounded text-xs cursor-pointer hover:bg-muted/80"
                      onClick={() => insertExampleCommand(cmd)}
                    >
                      {cmd}
                    </code>
                  ))}
                </div>
                
                <h4 className="font-semibold text-sm mt-4">Gemini CLI</h4>
                <div className="space-y-1">
                  {[
                    'gemini -p "Build a machine learning pipeline" --yolo',
                    'gemini -p "Optimize database performance" --yolo',
                    'gemini -p "Create API documentation" --yolo'
                  ].map((cmd, i) => (
                    <code 
                      key={i}
                      className="block bg-muted px-2 py-1 rounded text-xs cursor-pointer hover:bg-muted/80"
                      onClick={() => insertExampleCommand(cmd)}
                    >
                      {cmd}
                    </code>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Background Tasks
                <Button
                  size="sm"
                  variant="outline"
                  onClick={fetchBackgroundTasks}
                >
                  Refresh
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {backgroundTasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No background tasks</p>
                ) : (
                  backgroundTasks.map((task) => (
                    <div key={task.taskId} className="flex items-center gap-2 p-2 bg-muted rounded">
                      {task.status === 'running' && <Clock className="h-4 w-4 text-blue-500" />}
                      {task.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {task.status === 'failed' && <XCircle className="h-4 w-4 text-red-500" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-mono truncate">{task.command}</p>
                        <p className="text-xs text-muted-foreground">
                          {task.status} | {new Date(task.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => checkTaskStatus(task.taskId)}
                      >
                        Check
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Plans
                <Button
                  size="sm"
                  variant="outline"
                  onClick={fetchPlans}
                >
                  Refresh
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {plans.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No plans created yet</p>
                ) : (
                  plans.map((plan, i) => (
                    <div key={i} className="text-xs bg-muted p-2 rounded">
                      {plan.name}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Projects
                <Button
                  size="sm"
                  variant="outline"
                  onClick={fetchProjects}
                >
                  Refresh
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {projects.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No projects created yet</p>
                ) : (
                  projects.map((project, i) => (
                    <div key={i} className="text-xs bg-muted p-2 rounded">
                      {project.name}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Allowed Commands</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              {[
                "ls", "pwd", "echo", "cat", "grep", "find", "wc", "head", "tail",
                "npm", "yarn", "node", "npx", "git",
                "mkdir", "touch", "rm", "cp", "mv", "claude", "gemini"
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
              Security restrictions: No sudo, no system modifications, 30s timeout. 
              Background tasks for long-running CLI operations.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}