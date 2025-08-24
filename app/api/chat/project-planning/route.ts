import { NextRequest, NextResponse } from "next/server";
import { Message as VercelChatMessage, StreamingTextResponse } from "ai";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { HttpResponseOutputParser } from "langchain/output_parsers";

export const runtime = "edge";

const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`;
};

const PROJECT_PLANNING_TEMPLATE = `You are an expert project planning AI assistant specializing in software development projects. Your role is to help break down complex projects into manageable tasks, suggest architectures, identify dependencies, and create realistic timelines.

Key capabilities:
- Project decomposition and task breakdown
- Technology stack recommendations
- Timeline estimation and milestone planning
- Risk assessment and mitigation strategies
- Resource allocation suggestions
- Best practices and architectural guidance

When planning projects, consider:
- Modern development practices (CI/CD, testing, documentation)
- Scalability and maintainability
- Security and performance
- Team size and skill levels
- Technology constraints and preferences

Current conversation:
{chat_history}

User: {input}

Provide detailed, actionable project planning guidance:`;

/**
 * Project Planning Chat Orchestrator
 * Specialized for breaking down development projects into manageable tasks
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];
    const previousMessages = messages.slice(0, -1);
    const currentMessageContent = messages[messages.length - 1].content;

    const formattedPreviousMessages = previousMessages.map(formatMessage);

    const prompt = PromptTemplate.fromTemplate(PROJECT_PLANNING_TEMPLATE);

    /**
     * Use a more capable model for complex project planning
     */
    const model = new ChatOpenAI({
      temperature: 0.3, // Lower temperature for more focused planning
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