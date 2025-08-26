"use client";

import { useState, Suspense, lazy } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';
import { LoaderCircle, ChevronDown } from 'lucide-react';

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-2">
    <LoaderCircle className="h-4 w-4 animate-spin text-muted-foreground" />
  </div>
);

// Interface for navigation links
interface NavLink {
  href: string;
  label: string;
  icon: string;
  lazy?: boolean;
  component?: () => Promise<{ default: React.ComponentType<any> }>;
}

// Navigation links configuration with lazy loading
const navLinks: NavLink[] = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/llm-providers", label: "LLM Providers", icon: "🤖" },
  { href: "/project-planning", label: "Project Planning", icon: "🎯" },
  { href: "/nextjs-dev", label: "Next.js Dev", icon: "⚛️" },
  { href: "/reactbits", label: "ReactBits", icon: "✨" },
  { href: "/terminal", label: "Terminal", icon: "💻" },
  { href: "/mcp-tools", label: "MCP Tools", icon: "🛠️" },
  { href: "/retrieval", label: "RAG", icon: "🐶" },
  { href: "/chat", label: "Chat", icon: "🏴‍☠️" },
  { href: "/agents", label: "Agents", icon: "🦜" },
  { href: "/structured_output", label: "Structured", icon: "🧱" },
];

export function ActiveLink({ 
  href, 
  children, 
  className 
}: { 
  href: string; 
  children: React.ReactNode; 
  className?: string;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname?.startsWith(href + '/');

  return (
    <Link
      href={href}
      className={cn(
        "text-sm hover:bg-accent hover:text-accent-foreground px-3 py-2 rounded-md transition-colors duration-200",
        isActive && "bg-accent text-accent-foreground font-medium",
        className
      )}
    >
      {children}
    </Link>
  );
}

export function LazyNavigation({ className }: { className?: string }) {
  const [loadedComponents, setLoadedComponents] = useState<Set<string>>(new Set());
  const [loadingComponents, setLoadingComponents] = useState<Set<string>>(new Set());

  const handleLinkClick = async (link: NavLink, e: React.MouseEvent) => {
    if (!link.lazy || loadedComponents.has(link.href)) {
      return; // Continue with normal navigation
    }

    // For lazy-loaded components, we could preload them here
    if (link.component && !loadingComponents.has(link.href)) {
      setLoadingComponents(prev => new Set(prev).add(link.href));
      
      try {
        await link.component();
        setLoadedComponents(prev => new Set(prev).add(link.href));
      } catch (error) {
        console.error(`Failed to preload component for ${link.href}:`, error);
      } finally {
        setLoadingComponents(prev => {
          const newSet = new Set(prev);
          newSet.delete(link.href);
          return newSet;
        });
      }
    }
  };

  return (
    <nav className={cn("flex gap-1 flex-col md:flex-row md:flex-wrap", className)}>
      {navLinks.map((link) => (
        <div key={link.href} className="relative">
          <ActiveLink 
            href={link.href}
            className="flex items-center gap-2"
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
            {loadingComponents.has(link.href) && (
              <LoaderCircle className="h-3 w-3 animate-spin ml-1" />
            )}
          </ActiveLink>
        </div>
      ))}
    </nav>
  );
}

// Collapsible navigation for mobile
export function CollapsibleNavigation({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn("md:hidden", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-md transition-colors duration-200"
      >
        <span>Navigation</span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </button>
      
      {isOpen && (
        <div className="mt-2 space-y-1">
          <Suspense fallback={<LoadingSpinner />}>
            <LazyNavigation />
          </Suspense>
        </div>
      )}
    </div>
  );
}