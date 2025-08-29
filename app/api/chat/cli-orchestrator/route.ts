import { NextRequest, NextResponse } from "next/server";
import { LangChainStream, StreamingTextResponse } from "ai";
import { createChatModel, parseProviderConfig } from "@/lib/llm-providers";

export const runtime = "nodejs";

// CLI command templates
const CLI_COMMANDS = {
  claude: {
    planning: (prompt: string) => `claude -p "${prompt} - Focus on detailed planning and architecture" --dangerously-skip-permissions`,
    development: (prompt: string) => `claude -p "${prompt} - Focus on code implementation and development tasks" --dangerously-skip-permissions`,
    analysis: (prompt: string) => `claude -p "${prompt} - Focus on analysis and review" --dangerously-skip-permissions`,
  },
  gemini: {
    planning: (prompt: string) => `gemini -p "${prompt} - Focus on detailed planning and architecture" --yolo`,
    development: (prompt: string) => `gemini -p "${prompt} - Focus on code implementation and development tasks" --yolo`,
    analysis: (prompt: string) => `gemini -p "${prompt} - Focus on analysis and review" --yolo`,
  }
};

// Function to determine the best approach (CLI vs API)
function shouldUseCli(prompt: string, taskType: 'planning' | 'development' | 'analysis'): {
  useCli: boolean;
  provider: 'claude' | 'gemini';
  reason: string;
} {
  const promptLower = prompt.toLowerCase();
  
  // Use CLI for complex, large-scale tasks
  const cliIndicators = [
    'create project', 'build application', 'develop system', 'implement feature',
    'generate code', 'write tests', 'deploy application', 'setup infrastructure',
    'analyze codebase', 'refactor code', 'optimize performance', 'security audit'
  ];
  
  const shouldUseCli = cliIndicators.some(indicator => promptLower.includes(indicator)) ||
                      prompt.length > 500 || // Long prompts = complex tasks
                      taskType === 'development'; // Development tasks prefer CLI
  
  // Choose provider based on task type
  const provider: 'claude' | 'gemini' = taskType === 'analysis' ? 'claude' : 'gemini';
  const reason = shouldUseCli 
    ? `Using ${provider} CLI for complex ${taskType} task`
    : `Using LangChain API for simple ${taskType} orchestration`;
  
  return { useCli: shouldUseCli, provider, reason };
}

// Function to execute CLI command via terminal API
async function executeCliCommand(command: string, background = true): Promise<{
  success: boolean;
  output: string;
  taskId?: string;
}> {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/terminal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        command,
        background,
        workingDirectory: process.cwd(),
      }),
    });
    
    const result = await response.json();
    
    if (background && result.taskId) {
      return {
        success: true,
        output: `Command started in background. Task ID: ${result.taskId}`,
        taskId: result.taskId,
      };
    }
    
    return {
      success: result.success,
      output: result.stdout || result.error || 'No output',
    };
  } catch (error) {
    return {
      success: false,
      output: `Failed to execute CLI command: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

// Function to get task status
async function getTaskStatus(taskId: string): Promise<any> {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/terminal?taskId=${taskId}`);
    return await response.json();
  } catch (error) {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, taskType = 'planning', useBackground = true, pollTaskId } = body;
    
    // If polling for task status
    if (pollTaskId) {
      const taskStatus = await getTaskStatus(pollTaskId);
      return NextResponse.json({
        taskId: pollTaskId,
        status: taskStatus?.status || 'unknown',
        output: taskStatus?.output || '',
        completed: taskStatus?.status === 'completed' || taskStatus?.status === 'failed',
      });
    }
    
    const lastMessage = messages[messages.length - 1];
    const prompt = lastMessage?.content || '';
    
    // Validate taskType
    const validTaskType: 'planning' | 'development' | 'analysis' = 
      ['planning', 'development', 'analysis'].includes(taskType) ? taskType : 'planning';
    
    // Determine execution strategy
    const strategy = shouldUseCli(prompt, validTaskType);
    
    if (strategy.useCli) {
      // Use CLI approach with proper type checking
      const providerCommands = CLI_COMMANDS[strategy.provider];
      const commandTemplate = providerCommands[validTaskType];
      const command = commandTemplate(prompt);
      
      const result = await executeCliCommand(command, useBackground);
      
      if (useBackground && result.taskId) {
        return NextResponse.json({
          type: 'background_task',
          taskId: result.taskId,
          message: `Started ${strategy.provider} CLI task in background`,
          command,
          strategy: strategy.reason,
          pollUrl: `/api/chat/cli-orchestrator`,
        });
      } else {
        return NextResponse.json({
          type: 'cli_result',
          output: result.output,
          success: result.success,
          command,
          strategy: strategy.reason,
        });
      }
    } else {
      // Use LangChain API approach for simple orchestration
      const { stream, handlers } = LangChainStream();
      
      try {
        const llmConfig = parseProviderConfig(body);
        const model = await createChatModel(llmConfig);
        
        // Enhanced prompt for orchestration
        const orchestrationPrompt = `You are a project orchestration assistant. Your role is to provide lightweight coordination and planning.

For complex development tasks, the system will use CLI tools (Claude/Gemini) to handle heavy lifting.
For simple questions and coordination, provide direct helpful responses.

Task Type: ${validTaskType}
Strategy: ${strategy.reason}

User Request: ${prompt}

Provide a helpful response that guides the user on next steps.`;
        
        model.invoke([{ role: "user", content: orchestrationPrompt }], {
          callbacks: [handlers],
        });
        
        return new StreamingTextResponse(stream);
      } catch (error) {
        console.error("LLM orchestration error:", error);
        return NextResponse.json(
          { error: "Failed to process request with LLM", details: error instanceof Error ? error.message : 'Unknown error' },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error("CLI Orchestrator error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    description: "CLI-first orchestration API that minimizes API key usage",
    features: [
      "Intelligent CLI vs API decision making",
      "Background task execution for complex operations",
      "Minimal API key usage for simple orchestration only",
      "Support for Claude and Gemini CLI tools",
      "Automatic plan and project management"
    ],
    usage: {
      "POST": "Send messages with optional taskType (planning|development|analysis)",
      "taskPolling": "Use pollTaskId to check background task status"
    },
    cliCommands: CLI_COMMANDS,
  });
}