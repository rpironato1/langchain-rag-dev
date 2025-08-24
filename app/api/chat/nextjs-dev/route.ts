import { NextRequest, NextResponse } from "next/server";
import { Message as VercelChatMessage, StreamingTextResponse } from "ai";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { HttpResponseOutputParser } from "langchain/output_parsers";

export const runtime = "edge";

const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`;
};

const NEXTJS_DEV_TEMPLATE = `You are an expert Next.js development assistant specializing in modern React development with the App Router, Tailwind CSS, Shadcn UI, and best practices.

Your expertise includes:
- Next.js 15+ with App Router architecture
- TypeScript development patterns
- Tailwind CSS for styling and responsive design
- Shadcn UI component integration and customization
- Server Components and Client Components
- API routes and server actions
- Database integration (Supabase, Prisma)
- Authentication and authorization
- Performance optimization and SEO
- Testing strategies (unit, integration, e2e)
- Deployment and CI/CD

When helping with development:
- Provide complete, working code examples
- Follow Next.js and React best practices
- Use TypeScript for type safety
- Implement responsive designs with Tailwind
- Leverage Shadcn UI components when appropriate
- Consider performance and accessibility
- Include error handling and loading states
- Suggest file structure and organization

Current conversation:
{chat_history}

User: {input}

Provide detailed Next.js development assistance with code examples:`;

/**
 * Next.js Development Chat Orchestrator
 * Specialized for Next.js App Router development with modern tools
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];
    const previousMessages = messages.slice(0, -1);
    const currentMessageContent = messages[messages.length - 1].content;

    const formattedPreviousMessages = previousMessages.map(formatMessage);

    const prompt = PromptTemplate.fromTemplate(NEXTJS_DEV_TEMPLATE);

    /**
     * Use a capable model for development assistance
     */
    const model = new ChatOpenAI({
      temperature: 0.2, // Lower temperature for more precise code
      model: "gpt-4o-mini",
    });

    const outputParser = new HttpResponseOutputParser();

    const chain = prompt.pipe(model).pipe(outputParser);

    const stream = await chain.stream({
      chat_history: formattedPreviousMessages.join("\n"),
      input: currentMessageContent,
    });

    return new StreamingTextResponse(stream);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}