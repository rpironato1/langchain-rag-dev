import { ChatWindow } from "@/components/ChatWindow";

export default function CliOrchestratorPage() {
  const InfoCard = () => (
    <div className="p-4 md:p-8 rounded bg-[#25252d] w-full max-h-[85%] overflow-hidden">
      <h1 className="text-3xl md:text-4xl mb-4">🤖 CLI-First Orchestrator</h1>
      <ul className="text-sm md:text-base flex flex-col gap-2">
        <li>
          <strong>🔧 CLI-First Approach:</strong> Uses Claude/Gemini CLI tools for complex tasks, API keys only for orchestration
        </li>
        <li>
          <strong>⚡ Background Processing:</strong> Long-running tasks execute in background with real-time status updates
        </li>
        <li>
          <strong>📁 Smart Organization:</strong> Automatically saves plans to &quot;planos/&quot; and creates projects in &quot;projetos/&quot;
        </li>
        <li>
          <strong>🎯 Intelligent Routing:</strong> Automatically chooses between CLI tools and API based on task complexity
        </li>
        <li>
          <strong>💰 Cost Optimization:</strong> Minimizes API key usage by preferring local CLI execution
        </li>
        <li>
          <strong>🔒 Security Flags:</strong> Supports --dangerously-skip-permissions and --yolo flags for advanced operations
        </li>
      </ul>
      <div className="mt-6 p-4 bg-green-900/20 rounded-lg border border-green-500/20">
        <h3 className="font-semibold text-green-300 mb-2">🚀 CLI Commands Available:</h3>
        <ul className="text-sm space-y-1 text-green-100">
          <li>• <code>claude -p &quot;your-request&quot; --dangerously-skip-permissions</code></li>
          <li>• <code>gemini -p &quot;your-request&quot; --yolo</code></li>
          <li>• Automatic plan generation and project setup</li>
          <li>• Background task execution for complex operations</li>
        </ul>
      </div>
      <div className="mt-4 p-4 bg-blue-900/20 rounded-lg border border-blue-500/20">
        <h3 className="font-semibold text-blue-300 mb-2">💡 Example Requests:</h3>
        <ul className="text-sm space-y-1 text-blue-100">
          <li>• &quot;Create a full-stack web application with authentication&quot;</li>
          <li>• &quot;Build a microservices architecture with Docker&quot;</li>
          <li>• &quot;Analyze this codebase and create optimization recommendations&quot;</li>
          <li>• &quot;Set up CI/CD pipeline with testing and deployment&quot;</li>
        </ul>
      </div>
    </div>
  );

  return (
    <ChatWindow
      endpoint="/api/chat/cli-orchestrator"
      emptyStateComponent={<InfoCard />}
      placeholder="Describe your project or task - I'll use CLI tools for heavy lifting..."
      emoji="🤖"
      showIngestForm={false}
      showIntermediateStepsToggle={false}
    />
  );
}