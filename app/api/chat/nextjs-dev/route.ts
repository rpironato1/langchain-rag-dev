import { NextRequest, NextResponse } from "next/server";
import { Message as VercelChatMessage, StreamingTextResponse } from "ai";
import { PromptTemplate } from "@langchain/core/prompts";
import { HttpResponseOutputParser } from "langchain/output_parsers";
import { createChatModel, parseProviderConfig } from "@/lib/llm-providers";

// Remove edge runtime for compatibility with dynamic imports
// export const runtime = "edge";

const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`;
};

const NEXTJS_DEV_TEMPLATE = `You are an expert Next.js development assistant specializing in modern React development with the App Router, Tailwind CSS, Shadcn UI, and best practices for projects of any scale and complexity.

Your expertise includes:
- Next.js 15+ with App Router architecture for both simple and enterprise applications
- TypeScript development patterns and advanced type systems
- Tailwind CSS for styling, responsive design, and design systems
- Shadcn UI component integration, customization, and theme systems
- Server Components and Client Components with optimal rendering strategies
- API routes, server actions, and middleware for complex backends
- Database integration (Supabase, Prisma, multiple databases)
- Authentication and authorization (NextAuth, custom solutions, RBAC)
- Performance optimization, SEO, and Core Web Vitals
- Testing strategies (unit, integration, e2e) with Jest, Vitest, Playwright
- Deployment strategies (Vercel, Docker, self-hosted, multi-environment)
- Monorepo setup with Turbopack, Nx, or Rush
- Microservices integration and API orchestration
- State management (Zustand, Redux, React Context) for complex apps
- Real-time features (WebSockets, Server-Sent Events, WebRTC)
- Internationalization (i18n) and accessibility (a11y)
- CI/CD pipelines and automated testing workflows

For enterprise and complex projects:
- Modular architecture with feature-based organization
- Component libraries and design systems
- Multi-tenant applications and white-labeling
- Advanced caching strategies (ISR, edge caching, Redis)
- Error monitoring and observability (Sentry, DataDog)
- Security best practices and compliance (GDPR, SOC2)
- Scalable file uploads and media handling
- Background job processing and queues
- Service integration patterns and API design

When helping with development:
- Provide complete, production-ready code examples
- Follow Next.js and React best practices for scale
- Use TypeScript for type safety and maintainability
- Implement responsive designs with Tailwind and proper semantic HTML
- Leverage Shadcn UI components with custom variants
- Consider performance, accessibility, and SEO implications
- Include comprehensive error handling and loading states
- Suggest optimal file structure and code organization
- Recommend testing approaches and implementation
- Consider security implications and best practices

Current conversation:
{chat_history}

User: {input}

Provide detailed Next.js development assistance with complete, production-ready code examples and architectural guidance:`;

/**
 * Enhanced Next.js Development Chat Orchestrator
 * Specialized for Next.js App Router development with modern tools for any project scale
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];
    const previousMessages = messages.slice(0, -1);
    const currentMessageContent = messages[messages.length - 1].content;

    const formattedPreviousMessages = previousMessages.map(formatMessage);

    const prompt = PromptTemplate.fromTemplate(NEXTJS_DEV_TEMPLATE);

    // Parse provider configuration from request or use defaults
    const providerConfig = parseProviderConfig(body);

    /**
     * Use a capable model for development assistance
     * Allow different providers for different coding strengths
     */
    const model = await createChatModel({
      ...providerConfig,
      temperature: 0.2, // Lower temperature for more precise code
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