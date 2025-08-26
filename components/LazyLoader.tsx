"use client";

import React, { Suspense, lazy } from 'react';
import { LoaderCircle } from 'lucide-react';

// Loading spinner component
export const LoadingSpinner = ({ message = "Loading..." }: { message?: string }) => (
  <div className="flex flex-col items-center justify-center h-64 space-y-4">
    <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
    <p className="text-sm text-muted-foreground">{message}</p>
  </div>
);

// Generic lazy wrapper component
export const LazyWrapper = ({ 
  children, 
  fallback 
}: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
}) => (
  <Suspense fallback={fallback || <LoadingSpinner />}>
    {children}
  </Suspense>
);

// Lazy load heavy components
export const LazyChatWindow = lazy(() => 
  import('./ChatWindow').then(mod => ({ default: mod.ChatWindow }))
);

export const LazyUploadDocumentsForm = lazy(() => 
  import('./UploadDocumentsForm').then(mod => ({ default: mod.UploadDocumentsForm }))
);

// Lazy load page components
export const LazyDashboard = lazy(() => import('../app/dashboard/page'));
export const LazyChat = lazy(() => import('../app/chat/page'));
export const LazyProjectPlanning = lazy(() => import('../app/project-planning/page'));
export const LazyNextjsDev = lazy(() => import('../app/nextjs-dev/page'));
export const LazyReactbits = lazy(() => import('../app/reactbits/page'));
export const LazyTerminal = lazy(() => import('../app/terminal/page'));
export const LazyMcpTools = lazy(() => import('../app/mcp-tools/page'));
export const LazyRetrieval = lazy(() => import('../app/retrieval/page'));
export const LazyAgents = lazy(() => import('../app/agents/page'));
export const LazyStructuredOutput = lazy(() => import('../app/structured_output/page'));
export const LazyRetrievalAgents = lazy(() => import('../app/retrieval_agents/page'));
export const LazyLangGraph = lazy(() => import('../app/langgraph/page'));
export const LazyLlmProviders = lazy(() => import('../app/llm-providers/page'));

// Hook for dynamic imports
export const useLazyImport = () => {
  const loadComponent = async (componentPath: string) => {
    try {
      const mod = await import(componentPath);
      return mod.default;
    } catch (error) {
      console.error(`Failed to load component: ${componentPath}`, error);
      throw error;
    }
  };

  return { loadComponent };
};

// Component for lazy navigation links
export const LazyNavLink = ({ 
  href, 
  children, 
  onClick 
}: { 
  href: string; 
  children: React.ReactNode; 
  onClick?: () => void;
}) => {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <a href={href} onClick={handleClick}>
      {children}
    </a>
  );
};