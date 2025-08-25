import { ChatWindow } from "@/components/ChatWindow";

export default function NextJSDevPage() {
  const InfoCard = () => (
    <div className="p-4 md:p-8 rounded bg-[#25252d] w-full max-h-[85%] overflow-hidden">
      <h1 className="text-3xl md:text-4xl mb-4">⚛️ Next.js Development Orchestrator</h1>
      <ul className="text-sm md:text-base flex flex-col gap-2">
        <li>
          <strong>🚀 App Router:</strong> Next.js 15+ with modern app directory structure
        </li>
        <li>
          <strong>🎨 Tailwind CSS:</strong> Responsive design and utility-first styling
        </li>
        <li>
          <strong>🧩 Shadcn UI:</strong> Beautiful, accessible component library integration
        </li>
        <li>
          <strong>📱 Server Components:</strong> RSC patterns and client/server boundaries
        </li>
        <li>
          <strong>🔗 API Routes:</strong> Server actions and route handlers
        </li>
        <li>
          <strong>💾 Database Integration:</strong> Supabase, Prisma, and data fetching patterns
        </li>
        <li>
          <strong>🔐 Authentication:</strong> Secure auth flows and session management
        </li>
        <li>
          <strong>⚡ Performance:</strong> Optimization, SEO, and Core Web Vitals
        </li>
      </ul>
      <div className="mt-6 p-4 bg-green-900/20 rounded-lg border border-green-500/20">
        <h3 className="font-semibold text-green-300 mb-2">💡 Example Prompts:</h3>
        <ul className="text-sm space-y-1 text-green-100">
          <li>• &quot;Create a dashboard layout with sidebar navigation using Shadcn UI&quot;</li>
          <li>• &quot;Build a user authentication system with Supabase and Next.js&quot;</li>
          <li>• &quot;Design a responsive data table with sorting and filtering&quot;</li>
          <li>• &quot;Implement real-time updates using Server-Sent Events&quot;</li>
          <li>• &quot;Set up form validation with Zod and React Hook Form&quot;</li>
        </ul>
      </div>
    </div>
  );

  return (
    <ChatWindow
      endpoint="/api/chat/nextjs-dev"
      emptyStateComponent={<InfoCard />}
      placeholder="Ask for Next.js development help..."
      emoji="⚛️"
      showIngestForm={false}
      showIntermediateStepsToggle={false}
    />
  );
}