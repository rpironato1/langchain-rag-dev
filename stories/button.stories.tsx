import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../components/ui/button';
import { action } from '@storybook/addon-actions';

/**
 * Button component with multiple variants, sizes, and states.
 * Built with Radix UI and styled with Tailwind CSS for accessibility and customization.
 * 
 * ## Features
 * - Multiple variants: default, destructive, outline, secondary, ghost, link
 * - Different sizes: sm, default, lg, icon
 * - Accessibility compliant with keyboard navigation and screen reader support
 * - Dark theme optimized with proper contrast ratios
 */
const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile button component with multiple variants and sizes, optimized for accessibility and dark theme.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      description: 'Visual style variant of the button',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'default', 'lg', 'icon'],
      description: 'Size of the button',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the button is disabled',
    },
    asChild: {
      control: { type: 'boolean' },
      description: 'Render as child component (Slot from Radix UI)',
    },
    onClick: {
      action: 'clicked',
      description: 'Click event handler',
    },
  },
  args: {
    onClick: action('clicked'),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  args: {
    children: 'Button',
  },
};

// Variant stories
export const Primary: Story = {
  args: {
    variant: 'default',
    children: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Delete',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline Button',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
  },
};

export const Link: Story = {
  args: {
    variant: 'link',
    children: 'Link Button',
  },
};

// Size stories
export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large Button',
  },
};

export const IconButton: Story = {
  args: {
    size: 'icon',
    children: '🚀',
  },
};

// State stories
export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled Button',
  },
};

export const Loading: Story = {
  args: {
    disabled: true,
    children: (
      <>
        <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        Loading...
      </>
    ),
  },
};

// All variants showcase
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4 p-4">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Button Variants</h3>
        <div className="flex flex-wrap gap-2">
          <Button variant="default">Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Button Sizes</h3>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon">🎯</Button>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Button States</h3>
        <div className="flex flex-wrap gap-2">
          <Button>Normal</Button>
          <Button disabled>Disabled</Button>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Showcase of all button variants, sizes, and states.',
      },
    },
  },
};

// Responsive test
export const ResponsiveTest: Story = {
  render: () => (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-semibold text-foreground">Responsive Button Layout</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <Button variant="default" className="w-full">Mobile First</Button>
        <Button variant="secondary" className="w-full">Responsive</Button>
        <Button variant="outline" className="w-full">Grid Layout</Button>
        <Button variant="ghost" className="w-full">Testing</Button>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <Button className="flex-1">Flexible Layout</Button>
        <Button variant="outline" className="flex-1">Adapts to Screen</Button>
      </div>
    </div>
  ),
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
    docs: {
      description: {
        story: 'Test button responsiveness across different screen sizes.',
      },
    },
  },
};

// Accessibility test
export const AccessibilityTest: Story = {
  render: () => (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-semibold text-foreground">Accessibility Features</h3>
      <div className="space-y-2">
        <Button aria-label="Save document" title="Save the current document">
          💾 Save
        </Button>
        <Button 
          variant="destructive" 
          aria-label="Delete item permanently"
          aria-describedby="delete-warning"
        >
          🗑️ Delete
        </Button>
        <p id="delete-warning" className="text-sm text-muted-foreground">
          This action cannot be undone
        </p>
        <Button disabled aria-label="Action not available">
          ⏳ Unavailable
        </Button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Examples showcasing proper accessibility attributes and ARIA labels.',
      },
    },
  },
};