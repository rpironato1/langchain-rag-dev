import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Target, 
  Code, 
  Terminal, 
  Wrench, 
  Sparkles, 
  Database, 
  Users, 
  Bot,
  ArrowRight,
  Zap
} from "lucide-react";

export default function DashboardPage() {
  const features = [
    {
      title: "Project Planning Orchestrator",
      description: "AI-powered project planning with task breakdown, architecture recommendations, and timeline estimation",
      icon: <Target className="h-6 w-6" />,
      href: "/project-planning",
      badge: "Planning",
      color: "bg-blue-500/10 text-blue-400 border-blue-500/20"
    },
    {
      title: "Next.js Development Assistant",
      description: "Specialized development help for Next.js 15+, App Router, Tailwind CSS, and Shadcn UI",
      icon: <Code className="h-6 w-6" />,
      href: "/nextjs-dev",
      badge: "Development",
      color: "bg-green-500/10 text-green-400 border-green-500/20"
    },
    {
      title: "Terminal Interface",
      description: "Execute safe terminal commands with security restrictions and real-time output",
      icon: <Terminal className="h-6 w-6" />,
      href: "/terminal",
      badge: "Execution",
      color: "bg-orange-500/10 text-orange-400 border-orange-500/20"
    },
    {
      title: "MCP Tools",
      description: "Model Context Protocol tools for file operations, web requests, and system integration",
      icon: <Wrench className="h-6 w-6" />,
      href: "/mcp-tools",
      badge: "Integration",
      color: "bg-purple-500/10 text-purple-400 border-purple-500/20"
    },
    {
      title: "ReactBits Generator",
      description: "AI-powered React component generation with TypeScript, Tailwind, and best practices",
      icon: <Sparkles className="h-6 w-6" />,
      href: "/reactbits",
      badge: "Components",
      color: "bg-pink-500/10 text-pink-400 border-pink-500/20"
    },
    {
      title: "RAG with Supabase",
      description: "Enhanced retrieval-augmented generation with document ingestion and vector search",
      icon: <Database className="h-6 w-6" />,
      href: "/retrieval",
      badge: "Knowledge",
      color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
    }
  ];

  const originalFeatures = [
    {
      title: "Basic Chat",
      description: "Simple LLM chat with streaming responses",
      icon: <Bot className="h-5 w-5" />,
      href: "/",
      badge: "Chat"
    },
    {
      title: "Structured Output",
      description: "Get formatted responses using OpenAI Functions",
      icon: <Zap className="h-5 w-5" />,
      href: "/structured_output",
      badge: "Output"
    },
    {
      title: "Agents",
      description: "Multi-step reasoning with LangGraph agents",
      icon: <Users className="h-5 w-5" />,
      href: "/agents",
      badge: "Agents"
    },
    {
      title: "Retrieval Agents",
      description: "RAG-powered agents for complex queries",
      icon: <Database className="h-5 w-5" />,
      href: "/retrieval_agents",
      badge: "RAG"
    }
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-green-400 bg-clip-text text-transparent">
            Development Platform
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A comprehensive AI-powered development environment with project planning, code generation, 
            terminal access, and advanced tooling integration.
          </p>
        </div>

        {/* New Features */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-yellow-500" />
            <h2 className="text-2xl font-semibold">Enhanced Features</h2>
            <Badge variant="secondary">New</Badge>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className={feature.color}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {feature.icon}
                      <Badge variant="outline">{feature.badge}</Badge>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {feature.description}
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={feature.href} className="flex items-center gap-2">
                      Open
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Original Features */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-blue-500" />
            <h2 className="text-2xl font-semibold">Core LangChain Features</h2>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {originalFeatures.map((feature) => (
              <Card key={feature.title}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    {feature.icon}
                    <Badge variant="secondary" className="text-xs">{feature.badge}</Badge>
                  </div>
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {feature.description}
                  </p>
                  <Button asChild variant="ghost" size="sm" className="w-full">
                    <Link href={feature.href}>
                      Try it
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Capabilities Overview */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Platform Capabilities</h2>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  Project Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• AI-powered project planning and task breakdown</li>
                  <li>• Technology stack recommendations</li>
                  <li>• Timeline estimation and milestone planning</li>
                  <li>• Risk assessment and mitigation strategies</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-green-500" />
                  Development Tools
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Next.js 15+ with App Router expertise</li>
                  <li>• Component generation with TypeScript</li>
                  <li>• Tailwind CSS and Shadcn UI integration</li>
                  <li>• Code examples and best practices</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-orange-500" />
                  Execution Environment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Safe terminal command execution</li>
                  <li>• File system operations via MCP</li>
                  <li>• Real-time output and error handling</li>
                  <li>• Security restrictions and sandboxing</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-purple-500" />
                  Knowledge & Integration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Document ingestion and vector search</li>
                  <li>• Supabase integration for RAG</li>
                  <li>• External API and web integration</li>
                  <li>• LangGraph for complex workflows</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}