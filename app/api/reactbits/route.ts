import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

// Remove edge runtime for compatibility with dynamic imports and Vercel deployment
// export const runtime = "edge";

// Available UI components that can be referenced in AI generation
const AVAILABLE_COMPONENTS = [
  "Button", "Card", "Input", "Textarea", "Badge", "Dialog", "Drawer", 
  "Label", "Checkbox", "Select", "Popover"
];

const REACTBITS_TEMPLATE = `You are an expert React component generator specializing in creating high-quality, reusable components using modern React patterns, TypeScript, Tailwind CSS, and Shadcn UI design principles.

When generating components:
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

Available UI components to import: {availableComponents}

User request: {input}

Generate a complete, production-ready React component:`;

export async function GET() {
  return NextResponse.json({
    description: "ReactBits - AI-powered React component generation",
    availableComponents: AVAILABLE_COMPONENTS,
    usage: "POST with { prompt: string }"
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt } = body;
    
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }
    
    // Generate custom component using AI
    const promptTemplate = PromptTemplate.fromTemplate(REACTBITS_TEMPLATE);
    
    const model = new ChatOpenAI({
      temperature: 0.3,
      model: "gpt-4o-mini",
    });
    
    const chain = promptTemplate.pipe(model);
    
    const result = await chain.invoke({
      availableComponents: AVAILABLE_COMPONENTS.join(", "),
      input: prompt
    });
    
    return NextResponse.json({
      type: "generated",
      prompt,
      code: result.content,
      timestamp: new Date().toISOString(),
      suggestions: [
        "Add prop validation with PropTypes or Zod",
        "Consider adding unit tests with Jest and React Testing Library",
        "Add Storybook stories for component documentation",
        "Implement dark mode support with CSS variables"
      ]
    });
    
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to generate component", details: error.message },
      { status: 500 }
    );
  }
}