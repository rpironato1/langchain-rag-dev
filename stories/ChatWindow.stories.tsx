import type { Meta, StoryObj } from '@storybook/react';
import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '../components/LazyLoader';

// Lazy load the ChatWindow component
const LazyLoadedChatWindow = lazy(() => 
  import('../components/ChatWindow').then(mod => ({ 
    default: mod.ChatWindow 
  }))
);

/**
 * Lazy-loaded ChatWindow component for real-time AI conversations.
 * This story demonstrates lazy loading implementation to reduce initial bundle size.
 * 
 * ## Lazy Loading Features
 * - Component is loaded only when story is accessed
 * - Reduces initial Storybook bundle size
 * - Shows loading state during component loading
 * - Optimizes deployment performance
 * 
 * ## Chat Features
 * - Real-time streaming chat interface
 * - Document upload for RAG functionality
 * - Intermediate steps toggle for debugging
 * - Responsive design optimized for mobile and desktop
 * - Dark theme with proper contrast
 * - Accessibility features for screen readers
 */
const meta: Meta<typeof LazyLoadedChatWindow> = {
  title: 'Lazy/ChatWindow',
  component: LazyLoadedChatWindow,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A lazy-loaded chat interface that reduces initial bundle size and demonstrates performance optimization techniques.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Suspense fallback={<LoadingSpinner message="Loading ChatWindow component..." />}>
        <div className="h-screen bg-background">
          <Story />
        </div>
      </Suspense>
    ),
  ],
  argTypes: {
    endpoint: {
      control: 'text',
      description: 'API endpoint for chat messages',
      defaultValue: 'api/chat',
    },
    emoji: {
      control: 'text',
      description: 'Emoji to display for AI messages',
      defaultValue: '🤖',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for input field',
      defaultValue: 'Type your message...',
    },
    emptyStateComponent: {
      control: false,
      description: 'Component to show when chat is empty',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default lazy-loaded chat window with standard configuration
 */
export const Default: Story = {
  args: {
    endpoint: "api/chat",
    emoji: "🤖",
    placeholder: "Ask me anything...",
  },
  parameters: {
    docs: {
      description: {
        story: 'Basic chat interface loaded lazily for optimal performance.',
      },
    },
  },
};

/**
 * Pirate-themed chat interface (matching the original template)
 */
export const PirateChat: Story = {
  args: {
    endpoint: "api/chat",
    emoji: "🏴‍☠️",
    placeholder: "I'm an LLM pretending to be a pirate! Ask me about the pirate life!",
  },
  parameters: {
    docs: {
      description: {
        story: 'Pirate-themed chat interface with lazy loading.',
      },
    },
  },
};

/**
 * RAG-enabled chat for document-based conversations
 */
export const RAGChat: Story = {
  args: {
    endpoint: "api/retrieval/ingest",
    emoji: "📚",
    placeholder: "Ask questions about your uploaded documents...",
  },
  parameters: {
    docs: {
      description: {
        story: 'Chat interface optimized for RAG (Retrieval-Augmented Generation) with document upload capabilities.',
      },
    },
  },
};

/**
 * Loading state demonstration
 */
export const LoadingState: Story = {
  args: {
    endpoint: "api/chat",
    emoji: "⏳",
    placeholder: "Loading chat interface...",
  },
  decorators: [
    (Story) => (
      <div className="h-screen bg-background">
        <LoadingSpinner message="Simulating component loading..." />
        <div style={{ display: 'none' }}>
          <Story />
        </div>
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the loading state shown while lazy components are being loaded.',
      },
    },
  },
};