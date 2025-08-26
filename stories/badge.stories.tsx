import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '../components/ui/badge';

/**
 * Badge component for displaying status, labels, and metadata.
 * Built with multiple variants and optimized for dark theme readability.
 * 
 * ## Features
 * - Multiple variants: default, secondary, destructive, outline
 * - Proper contrast ratios for accessibility
 * - Focus states for interactive usage
 * - Consistent sizing and typography
 */
const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile badge component for status indicators and labels, optimized for dark theme.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'secondary', 'destructive', 'outline'],
      description: 'Visual style variant of the badge',
    },
    children: {
      control: { type: 'text' },
      description: 'Badge content',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  args: {
    children: 'Badge',
  },
};

// Variant stories
export const Primary: Story = {
  args: {
    variant: 'default',
    children: 'Primary',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Error',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline',
  },
};

// Status badges
export const StatusBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default" className="bg-green-600 hover:bg-green-700">
        ✓ Active
      </Badge>
      <Badge variant="secondary">
        ⏸️ Paused
      </Badge>
      <Badge variant="destructive">
        ✗ Failed
      </Badge>
      <Badge variant="outline" className="border-yellow-500 text-yellow-400">
        ⚠️ Warning
      </Badge>
      <Badge variant="outline" className="border-blue-500 text-blue-400">
        🔄 Processing
      </Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Examples of status badges with semantic colors and icons.',
      },
    },
  },
};

// Size variations
export const SizeVariations: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Badge className="text-xs px-2 py-0.5">Small</Badge>
      <Badge className="text-sm px-3 py-1">Medium</Badge>
      <Badge className="text-base px-4 py-1.5">Large</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Custom size variations using className overrides.',
      },
    },
  },
};

// Use cases
export const UseCases: Story = {
  render: () => (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h4 className="text-sm font-semibold mb-2 text-foreground">Notification Count</h4>
        <div className="flex items-center gap-2">
          <span className="text-foreground">Messages</span>
          <Badge variant="destructive">3</Badge>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-2 text-foreground">Feature Tags</h4>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">New</Badge>
          <Badge variant="outline">Beta</Badge>
          <Badge variant="default">Popular</Badge>
          <Badge variant="destructive">Deprecated</Badge>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-2 text-foreground">User Roles</h4>
        <div className="flex flex-wrap gap-2">
          <Badge variant="default">Admin</Badge>
          <Badge variant="secondary">Moderator</Badge>
          <Badge variant="outline">User</Badge>
          <Badge variant="outline">Guest</Badge>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-2 text-foreground">Priority Levels</h4>
        <div className="flex flex-wrap gap-2">
          <Badge variant="destructive">High</Badge>
          <Badge variant="outline" className="border-yellow-500 text-yellow-400">Medium</Badge>
          <Badge variant="secondary">Low</Badge>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-2 text-foreground">Technology Stack</h4>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="border-blue-500 text-blue-400">React</Badge>
          <Badge variant="outline" className="border-green-500 text-green-400">Node.js</Badge>
          <Badge variant="outline" className="border-purple-500 text-purple-400">TypeScript</Badge>
          <Badge variant="outline" className="border-orange-500 text-orange-400">Storybook</Badge>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Common use cases and patterns for badge components.',
      },
    },
  },
};

// Interactive badges
export const InteractiveBadges: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold mb-2 text-foreground">Clickable Tags</h4>
        <div className="flex flex-wrap gap-2">
          <Badge 
            variant="outline" 
            className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
            onClick={() => alert('Tag clicked!')}
          >
            #react
          </Badge>
          <Badge 
            variant="outline" 
            className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
            onClick={() => alert('Tag clicked!')}
          >
            #typescript
          </Badge>
          <Badge 
            variant="outline" 
            className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
            onClick={() => alert('Tag clicked!')}
          >
            #storybook
          </Badge>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-2 text-foreground">Removable Tags</h4>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="pr-1">
            JavaScript
            <button 
              className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
              onClick={() => alert('Remove clicked!')}
            >
              ✕
            </button>
          </Badge>
          <Badge variant="secondary" className="pr-1">
            Python
            <button 
              className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
              onClick={() => alert('Remove clicked!')}
            >
              ✕
            </button>
          </Badge>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Examples of interactive badges with click and remove functionality.',
      },
    },
  },
};

// All variants showcase
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-semibold text-foreground">All Badge Variants</h3>
      
      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-medium mb-2 text-muted-foreground">Default Variants</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2 text-muted-foreground">With Icons</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">🚀 Launch</Badge>
            <Badge variant="secondary">📊 Analytics</Badge>
            <Badge variant="destructive">⚠️ Critical</Badge>
            <Badge variant="outline">🔧 Settings</Badge>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2 text-muted-foreground">Numbers & Counts</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="destructive">99+</Badge>
            <Badge variant="default">12</Badge>
            <Badge variant="secondary">New</Badge>
            <Badge variant="outline">v2.1.0</Badge>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comprehensive showcase of all badge variants and use cases.',
      },
    },
  },
};

// Accessibility test
export const AccessibilityTest: Story = {
  render: () => (
    <div className="space-y-6 max-w-2xl">
      <h3 className="text-lg font-semibold text-foreground">Accessibility Features</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold mb-2">Screen Reader Labels</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="destructive" aria-label="3 unread notifications">
              3
            </Badge>
            <Badge variant="default" aria-label="Premium user status">
              Premium
            </Badge>
            <Badge variant="outline" aria-label="Version 2.1.0">
              v2.1.0
            </Badge>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-2">Interactive with Focus</h4>
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant="outline" 
              tabIndex={0}
              role="button"
              aria-label="Filter by React tag"
              className="cursor-pointer focus:ring-2 focus:ring-ring focus:ring-offset-2"
              onKeyDown={(e) => e.key === 'Enter' && alert('Filter applied!')}
            >
              React
            </Badge>
            <Badge 
              variant="outline" 
              tabIndex={0}
              role="button"
              aria-label="Filter by TypeScript tag"
              className="cursor-pointer focus:ring-2 focus:ring-ring focus:ring-offset-2"
              onKeyDown={(e) => e.key === 'Enter' && alert('Filter applied!')}
            >
              TypeScript
            </Badge>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-2">Status with Context</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span>System Status:</span>
              <Badge variant="default" aria-describedby="status-description">
                ✓ Online
              </Badge>
            </div>
            <p id="status-description" className="text-sm text-muted-foreground">
              All systems are operational
            </p>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Examples showcasing proper accessibility attributes and focus management.',
      },
    },
  },
};