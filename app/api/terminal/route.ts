import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export const runtime = "nodejs";

// Whitelist of allowed commands for security
const ALLOWED_COMMANDS = [
  "ls", "pwd", "echo", "cat", "grep", "find", "wc", "head", "tail",
  "npm", "yarn", "node", "npx", "git",
  "mkdir", "touch", "rm", "cp", "mv",
  "curl", "wget", "ping"
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
    const { command, workingDirectory = process.cwd() } = body;
    
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
    
    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: workingDirectory,
        timeout: 30000, // 30 second timeout
        maxBuffer: 1024 * 1024, // 1MB buffer
      });
      
      return NextResponse.json({
        success: true,
        stdout: stdout.toString(),
        stderr: stderr.toString(),
        command,
        workingDirectory,
      });
    } catch (execError: any) {
      return NextResponse.json({
        success: false,
        error: execError.message,
        stdout: execError.stdout?.toString() || "",
        stderr: execError.stderr?.toString() || "",
        command,
        workingDirectory,
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    allowedCommands: ALLOWED_COMMANDS,
    description: "Terminal execution API with security restrictions",
    usage: "POST with { command: string, workingDirectory?: string }",
  });
}