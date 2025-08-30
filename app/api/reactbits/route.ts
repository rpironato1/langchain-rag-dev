import { NextRequest, NextResponse } from "next/server";

// Remove edge runtime for compatibility with dynamic imports and Vercel deployment
// export const runtime = "edge";

// Available UI components that can be referenced in AI generation
const AVAILABLE_COMPONENTS = [
  "Button", "Card", "Input", "Textarea", "Badge", "Dialog", "Drawer", 
  "Label", "Checkbox", "Select", "Popover"
];

// Function to execute CLI command for component generation
async function generateComponentWithCli(prompt: string, useBackground = false): Promise<{
  success: boolean;
  output?: string;
  taskId?: string;
  error?: string;
}> {
  try {
    // Enhanced prompt for React component generation via CLI
    const enhancedPrompt = `Generate a React component using TypeScript, Tailwind CSS, and Shadcn UI patterns.

Requirements:
- Use TypeScript with proper type definitions
- Follow React best practices (hooks, composition, accessibility)
- Apply Tailwind CSS for styling with responsive design
- Include proper prop interfaces and forwardRef when needed
- Add JSDoc comments for complex props
- Consider accessibility (ARIA attributes, semantic HTML)
- Implement proper error boundaries and loading states
- Use cn() utility for conditional class names
- Follow Shadcn UI patterns and design tokens
- Import existing components from @/components/ui/ when possible

Available UI components to import: ${AVAILABLE_COMPONENTS.join(", ")}

User request: ${prompt}

Provide the complete React component code in a structured format with proper TypeScript definitions. Output should be ready for production use.`;

    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/chat/cli-orchestrator`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: enhancedPrompt }],
        taskType: 'development',
        useBackground
      })
    });
    
    const result = await response.json();
    
    if (result.type === 'background_task') {
      return {
        success: true,
        taskId: result.taskId,
        output: `Component generation started in background. Task ID: ${result.taskId}`
      };
    } else if (result.type === 'cli_result') {
      return {
        success: result.success,
        output: result.output
      };
    } else {
      return {
        success: false,
        error: 'Unexpected response from CLI orchestrator'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to execute CLI command: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// Function to poll task status
async function pollTaskStatus(taskId: string): Promise<any> {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/chat/cli-orchestrator`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pollTaskId: taskId
      })
    });
    
    return await response.json();
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const taskId = url.searchParams.get('taskId');
  
  if (taskId) {
    // Poll for task status
    const status = await pollTaskStatus(taskId);
    return NextResponse.json(status);
  }
  
  return NextResponse.json({
    description: "ReactBits - CLI-powered React component generation",
    availableComponents: AVAILABLE_COMPONENTS,
    usage: {
      "POST": "{ prompt: string, useBackground?: boolean }",
      "GET": "?taskId=<id> to poll task status"
    },
    features: [
      "CLI-first component generation using Claude/Gemini",
      "Background task execution for complex components",
      "Minimal API key usage",
      "Structured output with TypeScript support"
    ]
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, useBackground = false } = body;
    
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }
    
    // Use CLI orchestrator for component generation
    const result = await generateComponentWithCli(prompt, useBackground);
    
    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to generate component", details: result.error },
        { status: 500 }
      );
    }
    
    if (result.taskId) {
      // Background task started
      return NextResponse.json({
        type: "background_task",
        taskId: result.taskId,
        message: result.output,
        prompt,
        timestamp: new Date().toISOString(),
        pollUrl: `/api/reactbits?taskId=${result.taskId}`,
        suggestions: [
          "Task running in background using CLI tools",
          "Poll the taskId to get the generated component",
          "CLI approach minimizes API key usage",
          "Supports complex component generation without token limits"
        ]
      });
    } else {
      // Synchronous result
      return NextResponse.json({
        type: "generated",
        prompt,
        code: result.output,
        timestamp: new Date().toISOString(),
        method: "CLI-generated (claude/gemini)",
        suggestions: [
          "Generated using CLI tools for optimal performance",
          "Add prop validation with PropTypes or Zod",
          "Consider adding unit tests with Jest and React Testing Library",
          "Add Storybook stories for component documentation"
        ]
      });
    }
    
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to generate component", details: error.message },
      { status: 500 }
    );
  }
}