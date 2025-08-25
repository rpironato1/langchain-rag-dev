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

const PROJECT_PLANNING_TEMPLATE = `You are an expert project planning AI assistant specializing in software development projects of any size and complexity. Your role is to help break down complex projects into manageable tasks, suggest architectures, identify dependencies, and create realistic timelines.

Key capabilities:
- Project decomposition and task breakdown for projects ranging from simple scripts to enterprise systems
- Technology stack recommendations for modern and legacy systems
- Timeline estimation and milestone planning with risk assessment
- Modular architecture design with monorepo and microservice considerations
- Resource allocation suggestions for teams of any size
- Best practices and architectural guidance for scalable systems
- Integration patterns and API design
- DevOps and CI/CD pipeline recommendations
- Security and compliance considerations
- Performance optimization strategies

When planning projects, consider:
- Modern development practices (CI/CD, testing, documentation, monitoring)
- Scalability and maintainability across different project scales
- Security and performance requirements
- Team size, skill levels, and organizational constraints
- Technology constraints, preferences, and migration paths
- Modular design principles and dependency management
- Monorepo vs multi-repo strategies
- Microservice vs monolithic architecture decisions
- Cloud-native and containerization strategies
- Data architecture and storage solutions

For complex enterprise projects, focus on:
- Service decomposition and bounded contexts
- API gateway and service mesh considerations
- Event-driven architecture patterns
- CQRS and event sourcing when appropriate
- Distributed system challenges and solutions
- Cross-cutting concerns (logging, monitoring, security)

Current conversation:
{chat_history}

User: {input}

Provide detailed, actionable project planning guidance with specific recommendations for architecture, timeline, and implementation approach:`;

/**
 * Enhanced Project Planning Chat Orchestrator
 * Specialized for breaking down development projects of any size and complexity
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];
    const previousMessages = messages.slice(0, -1);
    const currentMessageContent = messages[messages.length - 1].content;

    const formattedPreviousMessages = previousMessages.map(formatMessage);

    const prompt = PromptTemplate.fromTemplate(PROJECT_PLANNING_TEMPLATE);

    // Parse provider configuration from request or use defaults
    const providerConfig = parseProviderConfig(body);

    /**
     * Use a more capable model for complex project planning
     * Allow provider selection for different capabilities
     */
    const model = await createChatModel({
      ...providerConfig,
      temperature: 0.3, // Lower temperature for more focused planning
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