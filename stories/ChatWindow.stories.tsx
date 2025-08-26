import type { Meta, StoryObj } from '@storybook/react';
import { ChatWindow, ChatInput, ChatLayout } from '../components/ChatWindow';
import { useState } from 'react';

/**
 * ChatWindow component for real-time AI conversations.
 * Built with streaming capabilities and intermediate step visualization.
 * 
 * ## Features
 * - Real-time streaming chat interface
 * - Document upload for RAG functionality
 * - Intermediate steps toggle for debugging
 * - Responsive design optimized for mobile and desktop
 * - Dark theme with proper contrast
 * - Accessibility features for screen readers
 */
const meta: Meta<typeof ChatWindow> = {
  title: 'Components/ChatWindow',
  component: ChatWindow,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A comprehensive chat interface for AI conversations with streaming, document upload, and debugging features.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    endpoint: {
      control: { type: 'text' },
      description: 'API endpoint for chat requests',
    },
    placeholder: {
      control: { type: 'text' },
      description: 'Input placeholder text',
    },
    emoji: {
      control: { type: 'text' },
      description: 'AI assistant emoji',
    },
    showIngestForm: {
      control: { type: 'boolean' },
      description: 'Show document upload functionality',
    },
    showIntermediateStepsToggle: {
      control: { type: 'boolean' },
      description: 'Show intermediate steps debugging option',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock empty state component
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-full text-center p-8">
    <div className="text-6xl mb-4">🤖</div>
    <h2 className="text-2xl font-semibold mb-2 text-foreground">Welcome to AI Chat</h2>
    <p className="text-muted-foreground max-w-md">
      Start a conversation with our AI assistant. You can ask questions, upload documents for context, 
      or explore advanced features.
    </p>
  </div>
);

// Default story with full functionality
export const Default: Story = {
  args: {
    endpoint: '/api/chat',
    emptyStateComponent: <EmptyState />,
    placeholder: 'Ask me anything...',
    emoji: '🤖',
    showIngestForm: true,
    showIntermediateStepsToggle: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Full-featured chat window with all options enabled.',
      },
    },
  },
};

// Simple chat without extra features
export const SimpleChat: Story = {
  args: {
    endpoint: '/api/chat',
    emptyStateComponent: <EmptyState />,
    placeholder: 'Type your message...',
    emoji: '💬',
    showIngestForm: false,
    showIntermediateStepsToggle: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Basic chat interface without document upload or debugging features.',
      },
    },
  },
};

// RAG-enabled chat
export const RAGChat: Story = {
  args: {
    endpoint: '/api/chat/retrieval',
    emptyStateComponent: (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="text-6xl mb-4">📚</div>
        <h2 className="text-2xl font-semibold mb-2 text-foreground">RAG Assistant</h2>
        <p className="text-muted-foreground max-w-md">
          Upload documents and ask questions about their content. The AI will use your documents 
          to provide accurate, contextual answers.
        </p>
      </div>
    ),
    placeholder: 'Ask about your documents...',
    emoji: '📚',
    showIngestForm: true,
    showIntermediateStepsToggle: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Chat interface optimized for Retrieval-Augmented Generation (RAG) with document upload.',
      },
    },
  },
};

// Debug mode chat
export const DebugChat: Story = {
  args: {
    endpoint: '/api/chat/debug',
    emptyStateComponent: (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="text-6xl mb-4">🔧</div>
        <h2 className="text-2xl font-semibold mb-2 text-foreground">Debug Assistant</h2>
        <p className="text-muted-foreground max-w-md">
          Developer mode with intermediate steps visibility. See how the AI processes 
          your requests step by step.
        </p>
      </div>
    ),
    placeholder: 'Debug query...',
    emoji: '🔧',
    showIngestForm: false,
    showIntermediateStepsToggle: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Chat interface with debugging features for developers.',
      },
    },
  },
};

// Mobile optimized view
export const MobileView: Story = {
  args: {
    endpoint: '/api/chat',
    emptyStateComponent: (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <div className="text-4xl mb-4">📱</div>
        <h2 className="text-xl font-semibold mb-2 text-foreground">Mobile Chat</h2>
        <p className="text-muted-foreground text-sm">
          Optimized for mobile devices with touch-friendly controls.
        </p>
      </div>
    ),
    placeholder: 'Tap to type...',
    emoji: '📱',
    showIngestForm: true,
    showIntermediateStepsToggle: false,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
    docs: {
      description: {
        story: 'Mobile-optimized chat interface with responsive design.',
      },
    },
  },
};

// ChatInput component standalone
export const ChatInputStandalone: Story = {
  render: () => {
    const [value, setValue] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setLoading(false);
        setValue('');
      }, 2000);
    };

    return (
      <div className="p-8 space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Chat Input Component</h3>
        <ChatInput
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onSubmit={handleSubmit}
          loading={loading}
          placeholder="Type your message..."
          onStop={() => setLoading(false)}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Standalone chat input component with loading states.',
      },
    },
  },
};

// Different themes and customizations
export const CustomStyling: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-foreground">Compact Style</h3>
        <div className="border border-border rounded-lg p-4 h-96">
          <ChatWindow
            endpoint="/api/chat"
            emptyStateComponent={
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Compact chat view</p>
              </div>
            }
            placeholder="Quick message..."
            emoji="⚡"
            showIngestForm={false}
            showIntermediateStepsToggle={false}
          />
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Examples of chat window with different styling approaches.',
      },
    },
  },
};

// Accessibility demonstration
export const AccessibilityFeatures: Story = {
  args: {
    endpoint: '/api/chat',
    emptyStateComponent: (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="text-6xl mb-4" role="img" aria-label="Accessibility icon">♿</div>
        <h2 className="text-2xl font-semibold mb-2 text-foreground">Accessible Chat</h2>
        <p className="text-muted-foreground max-w-md">
          This chat interface is built with accessibility in mind, featuring proper ARIA labels, 
          keyboard navigation, and screen reader support.
        </p>
        <div className="mt-4 text-sm text-muted-foreground">
          <p>✓ Keyboard navigation</p>
          <p>✓ Screen reader compatible</p>
          <p>✓ High contrast colors</p>
          <p>✓ Focus management</p>
        </div>
      </div>
    ),
    placeholder: 'Ask your question (accessible interface)...',
    emoji: '♿',
    showIngestForm: true,
    showIntermediateStepsToggle: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstration of accessibility features including ARIA labels, keyboard navigation, and screen reader support.',
      },
    },
  },
};

// Loading states showcase
export const LoadingStates: Story = {
  render: () => {
    const [loadingState, setLoadingState] = useState<'idle' | 'loading' | 'processing'>('idle');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setLoadingState('loading');
      setTimeout(() => {
        setLoadingState('processing');
        setTimeout(() => {
          setLoadingState('idle');
        }, 2000);
      }, 1000);
    };

    return (
      <div className="p-8 space-y-6">
        <h3 className="text-lg font-semibold text-foreground">Loading States</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Current State: {loadingState}</h4>
            <ChatInput
              value=""
              onChange={() => {}}
              onSubmit={handleSubmit}
              loading={loadingState !== 'idle'}
              placeholder={
                loadingState === 'idle' 
                  ? "Type to test loading states..." 
                  : loadingState === 'loading'
                  ? "Sending message..."
                  : "Processing response..."
              }
            />
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setLoadingState('idle')}
              className="px-3 py-1 bg-secondary text-secondary-foreground rounded text-sm"
            >
              Idle
            </button>
            <button 
              onClick={() => setLoadingState('loading')}
              className="px-3 py-1 bg-secondary text-secondary-foreground rounded text-sm"
            >
              Loading
            </button>
            <button 
              onClick={() => setLoadingState('processing')}
              className="px-3 py-1 bg-secondary text-secondary-foreground rounded text-sm"
            >
              Processing
            </button>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demonstration of different loading states and transitions.',
      },
    },
  },
};