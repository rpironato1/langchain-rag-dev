import { NextRequest, NextResponse } from "next/server";
import { exec, spawn } from "child_process";
import { promisify } from "util";
import * as path from "path";
import * as fs from "fs/promises";

const execAsync = promisify(exec);

export const runtime = "nodejs";

// Whitelist of allowed commands for security
const ALLOWED_COMMANDS = [
  "ls", "pwd", "echo", "cat", "grep", "find", "wc", "head", "tail",
  "npm", "yarn", "node", "npx", "git",
  "mkdir", "touch", "rm", "cp", "mv",
  "curl", "wget", "ping", "claude", "gemini"
];

const FORBIDDEN_PATTERNS = [
  /rm\s+-rf\s+\//, // Prevent rm -rf /
  /sudo/, // No sudo commands
  /passwd/, // No password changes
  /su\s/, // No user switching
  /chmod\s+777/, // No dangerous permissions
  />.+\.sh/, // No shell script creation
  /eval/, // No eval commands
  /exec/, // No exec commands
];

// Background task storage (in production, use a proper task queue/database)
const backgroundTasks = new Map<string, {
  id: string;
  command: string;
  status: 'running' | 'completed' | 'failed';
  output: string;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}>();

// Helper function to get project root
function getProjectRoot(): string {
  return process.cwd();
}

// Helper function to get plans directory
function getPlanosDir(): string {
  return path.join(getProjectRoot(), 'planos');
}

// Helper function to get projects directory
function getProjetosDir(): string {
  return path.join(getProjectRoot(), 'projetos');
}

// Helper function to create directories if they don't exist
async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

// Helper function to save plan to file
async function savePlan(planName: string, content: string): Promise<string> {
  const planosDir = getPlanosDir();
  await ensureDirectoryExists(planosDir);
  
  const fileName = `${planName.replace(/[^a-zA-Z0-9-_]/g, '_')}_${Date.now()}.md`;
  const filePath = path.join(planosDir, fileName);
  await fs.writeFile(filePath, content, 'utf-8');
  
  return filePath;
}

// Helper function to create project directory
async function createProjectDir(projectName: string): Promise<string> {
  const projetosDir = getProjetosDir();
  await ensureDirectoryExists(projetosDir);
  
  const projectDir = path.join(projetosDir, projectName.replace(/[^a-zA-Z0-9-_]/g, '_'));
  await ensureDirectoryExists(projectDir);
  
  return projectDir;
}

// Helper function to execute CLI commands with special handling for Claude and Gemini
async function executeCliCommand(command: string, workingDirectory: string): Promise<{
  success: boolean;
  stdout: string;
  stderr: string;
  metadata?: any;
}> {
  const commandParts = command.trim().split(/\s+/);
  const baseCommand = commandParts[0];
  
  // Special handling for Claude CLI
  if (baseCommand === 'claude') {
    const promptIndex = commandParts.indexOf('-p');
    if (promptIndex !== -1 && promptIndex + 1 < commandParts.length) {
      const prompt = commandParts[promptIndex + 1];
      const hasSkipPermissions = commandParts.includes('--dangerously-skip-permissions');
      
      // For demo purposes, simulate Claude CLI response
      // In production, this would call the actual Claude CLI
      const mockResponse = `Claude CLI Response for: "${prompt}"\n\n[This would be the actual Claude CLI output in production]\n\nCommand executed with ${hasSkipPermissions ? 'permissions skipped' : 'normal permissions'}`;
      
      return {
        success: true,
        stdout: mockResponse,
        stderr: '',
        metadata: {
          provider: 'claude',
          prompt,
          skipPermissions: hasSkipPermissions
        }
      };
    }
  }
  
  // Special handling for Gemini CLI
  if (baseCommand === 'gemini') {
    const promptIndex = commandParts.indexOf('-p');
    if (promptIndex !== -1 && promptIndex + 1 < commandParts.length) {
      const prompt = commandParts[promptIndex + 1];
      const hasYolo = commandParts.includes('--yolo');
      
      // For demo purposes, simulate Gemini CLI response
      // In production, this would call the actual Gemini CLI
      const mockResponse = `Gemini CLI Response for: "${prompt}"\n\n[This would be the actual Gemini CLI output in production]\n\nCommand executed with ${hasYolo ? 'YOLO mode' : 'normal mode'}`;
      
      return {
        success: true,
        stdout: mockResponse,
        stderr: '',
        metadata: {
          provider: 'gemini',
          prompt,
          yoloMode: hasYolo
        }
      };
    }
  }
  
  // Execute regular commands
  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd: workingDirectory,
      timeout: 30000, // 30 second timeout
      maxBuffer: 1024 * 1024, // 1MB buffer
    });
    
    return {
      success: true,
      stdout: stdout.toString(),
      stderr: stderr.toString(),
    };
  } catch (execError: any) {
    return {
      success: false,
      stdout: execError.stdout?.toString() || "",
      stderr: execError.stderr?.toString() || execError.message,
    };
  }
}

// Function to execute command in background
function executeInBackground(taskId: string, command: string, workingDirectory: string): void {
  const task = backgroundTasks.get(taskId);
  if (!task) return;
  
  executeCliCommand(command, workingDirectory)
    .then((result) => {
      task.status = result.success ? 'completed' : 'failed';
      task.output = result.stdout;
      task.error = result.stderr;
      task.completedAt = new Date();
      
      // If this was a plan generation command, save it
      if (command.includes('claude') || command.includes('gemini')) {
        const metadata = result.metadata;
        if (metadata && metadata.prompt) {
          const planName = `plan_${metadata.provider}_${taskId}`;
          savePlan(planName, `# Plan generated by ${metadata.provider}\n\n## Prompt\n${metadata.prompt}\n\n## Response\n${result.stdout}`)
            .catch(console.error);
        }
      }
    })
    .catch((error) => {
      task.status = 'failed';
      task.error = error.message;
      task.completedAt = new Date();
    });
}

function sanitizeCommand(command: string): { isValid: boolean; reason?: string } {
  // Check if command starts with allowed command
  const commandParts = command.trim().split(/\s+/);
  const baseCommand = commandParts[0];
  
  if (!ALLOWED_COMMANDS.includes(baseCommand)) {
    return { isValid: false, reason: `Command '${baseCommand}' is not allowed` };
  }
  
  // Check for forbidden patterns
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(command)) {
      return { isValid: false, reason: "Command contains forbidden pattern" };
    }
  }
  
  return { isValid: true };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { command, workingDirectory = process.cwd(), background = false, taskId } = body;
    
    if (!command) {
      return NextResponse.json({ error: "Command is required" }, { status: 400 });
    }
    
    // Sanitize and validate command
    const validation = sanitizeCommand(command);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: `Security violation: ${validation.reason}` },
        { status: 403 }
      );
    }
    
    // Handle background execution
    if (background) {
      const backgroundTaskId = taskId || `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      backgroundTasks.set(backgroundTaskId, {
        id: backgroundTaskId,
        command,
        status: 'running',
        output: '',
        createdAt: new Date(),
      });
      
      // Execute in background
      executeInBackground(backgroundTaskId, command, workingDirectory);
      
      return NextResponse.json({
        success: true,
        taskId: backgroundTaskId,
        message: 'Command started in background',
        command,
      });
    }
    
    // Execute command immediately
    const result = await executeCliCommand(command, workingDirectory);
    
    return NextResponse.json({
      success: result.success,
      stdout: result.stdout,
      stderr: result.stderr,
      command,
      workingDirectory,
      metadata: result.metadata,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get('taskId');
  const action = searchParams.get('action');
  
  // Get task status
  if (taskId) {
    const task = backgroundTasks.get(taskId);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    
    return NextResponse.json({
      taskId: task.id,
      command: task.command,
      status: task.status,
      output: task.output,
      error: task.error,
      createdAt: task.createdAt,
      completedAt: task.completedAt,
    });
  }
  
  // List all tasks
  if (action === 'list') {
    const tasks = Array.from(backgroundTasks.values()).map(task => ({
      taskId: task.id,
      command: task.command,
      status: task.status,
      createdAt: task.createdAt,
      completedAt: task.completedAt,
    }));
    
    return NextResponse.json({ tasks });
  }
  
  // Get plans directory
  if (action === 'plans') {
    try {
      const planosDir = getPlanosDir();
      await ensureDirectoryExists(planosDir);
      const files = await fs.readdir(planosDir);
      const plans = files.filter(f => f.endsWith('.md')).map(f => ({
        name: f,
        path: path.join(planosDir, f),
      }));
      
      return NextResponse.json({ plans, directory: planosDir });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
  
  // Get projects directory
  if (action === 'projects') {
    try {
      const projetosDir = getProjetosDir();
      await ensureDirectoryExists(projetosDir);
      const dirs = await fs.readdir(projetosDir, { withFileTypes: true });
      const projects = dirs.filter(d => d.isDirectory()).map(d => ({
        name: d.name,
        path: path.join(projetosDir, d.name),
      }));
      
      return NextResponse.json({ projects, directory: projetosDir });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
  
  // Default API info
  return NextResponse.json({
    allowedCommands: ALLOWED_COMMANDS,
    description: "Terminal execution API with security restrictions and CLI integration",
    usage: "POST with { command: string, workingDirectory?: string, background?: boolean }",
    endpoints: {
      "GET ?taskId=<id>": "Get task status",
      "GET ?action=list": "List all background tasks",
      "GET ?action=plans": "List all plans",
      "GET ?action=projects": "List all projects",
      "PUT": "Create new project directory"
    },
  });
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectName, description } = body;
    
    if (!projectName) {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    }
    
    const projectDir = await createProjectDir(projectName);
    
    // Create a basic README for the project
    const readmeContent = `# ${projectName}\n\n${description || 'Project description goes here'}\n\nCreated: ${new Date().toISOString()}\n`;
    await fs.writeFile(path.join(projectDir, 'README.md'), readmeContent, 'utf-8');
    
    return NextResponse.json({
      success: true,
      projectName,
      projectDir,
      message: 'Project directory created successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to create project", details: error.message },
      { status: 500 }
    );
  }
}