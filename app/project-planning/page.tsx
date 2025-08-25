import { ChatWindow } from "@/components/ChatWindow";

export default function ProjectPlanningPage() {
  const InfoCard = () => (
    <div className="p-4 md:p-8 rounded bg-[#25252d] w-full max-h-[85%] overflow-hidden">
      <h1 className="text-3xl md:text-4xl mb-4">🎯 Project Planning Orchestrator</h1>
      <ul className="text-sm md:text-base flex flex-col gap-2">
        <li>
          <strong>📋 Project Decomposition:</strong> Break down complex projects into manageable tasks and milestones
        </li>
        <li>
          <strong>🏗️ Architecture Planning:</strong> Get recommendations for technology stacks and system design
        </li>
        <li>
          <strong>⏱️ Timeline Estimation:</strong> Realistic project timelines with dependency mapping
        </li>
        <li>
          <strong>⚠️ Risk Assessment:</strong> Identify potential risks and mitigation strategies
        </li>
        <li>
          <strong>👥 Resource Planning:</strong> Team size and skill requirements analysis
        </li>
        <li>
          <strong>📊 Milestone Tracking:</strong> Create clear deliverables and success metrics
        </li>
      </ul>
      <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-500/20">
        <h3 className="font-semibold text-blue-300 mb-2">💡 Example Prompts:</h3>
        <ul className="text-sm space-y-1 text-blue-100">
          <li>• &quot;Plan a SaaS application for project management with user authentication&quot;</li>
          <li>• &quot;Break down an e-commerce platform build using Next.js and Supabase&quot;</li>
          <li>• &quot;Create a development timeline for a mobile-first web application&quot;</li>
          <li>• &quot;Analyze risks for a real-time chat application deployment&quot;</li>
        </ul>
      </div>
    </div>
  );

  return (
    <ChatWindow
      endpoint="/api/chat/project-planning"
      emptyStateComponent={<InfoCard />}
      placeholder="Describe your project and get a comprehensive plan..."
      emoji="🎯"
      showIngestForm={false}
      showIntermediateStepsToggle={false}
    />
  );
}