import type { Meta, StoryObj } from '@storybook/react';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useState } from 'react';

/**
 * Input component for form fields with dark theme optimization.
 * Built with accessibility and responsive design in mind.
 * 
 * ## Features
 * - Responsive text sizing (base on mobile, sm on desktop)
 * - Built-in focus states with ring outline
 * - Proper contrast ratios for dark theme
 * - File input support
 * - Disabled state handling
 */
const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A styled input component optimized for dark theme with proper accessibility features.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search', 'file'],
      description: 'Type of input field',
    },
    placeholder: {
      control: { type: 'text' },
      description: 'Placeholder text',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the input is disabled',
    },
    required: {
      control: { type: 'boolean' },
      description: 'Whether the input is required',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

// Input types
export const TextInput: Story = {
  args: {
    type: 'text',
    placeholder: 'Your name',
  },
};

export const EmailInput: Story = {
  args: {
    type: 'email',
    placeholder: 'your.email@example.com',
  },
};

export const PasswordInput: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password',
  },
};

export const NumberInput: Story = {
  args: {
    type: 'number',
    placeholder: '42',
    min: 0,
    max: 100,
  },
};

export const SearchInput: Story = {
  args: {
    type: 'search',
    placeholder: 'Search...',
  },
};

export const FileInput: Story = {
  args: {
    type: 'file',
    accept: '.txt,.md,.pdf',
  },
};

// States
export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
    value: 'Cannot edit this',
  },
};

export const WithValue: Story = {
  args: {
    placeholder: 'Enter text...',
    defaultValue: 'Pre-filled value',
  },
};

export const Required: Story = {
  args: {
    placeholder: 'Required field',
    required: true,
  },
};

// Form examples
export const WithLabel: Story = {
  render: () => (
    <div className="space-y-2 w-80">
      <Label htmlFor="name">Full Name</Label>
      <Input 
        id="name" 
        type="text" 
        placeholder="John Doe" 
        required 
      />
    </div>
  ),
};

export const FormExample: Story = {
  render: () => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      message: '',
    });

    return (
      <div className="space-y-4 w-96 p-4 border border-border rounded-md">
        <h3 className="text-lg font-semibold text-foreground">Contact Form</h3>
        
        <div className="space-y-2">
          <Label htmlFor="contact-name">Name</Label>
          <Input 
            id="contact-name"
            type="text" 
            placeholder="Your name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="contact-email">Email</Label>
          <Input 
            id="contact-email"
            type="email" 
            placeholder="your.email@example.com"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="contact-phone">Phone (Optional)</Label>
          <Input 
            id="contact-phone"
            type="tel" 
            placeholder="+1 (555) 123-4567"
          />
        </div>
        
        <div className="pt-2">
          <pre className="text-sm bg-muted p-2 rounded text-muted-foreground">
            {JSON.stringify(formData, null, 2)}
          </pre>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive form example showing real-time value updates.',
      },
    },
  },
};

// Validation states
export const ValidationStates: Story = {
  render: () => (
    <div className="space-y-6 w-80">
      <div className="space-y-2">
        <Label htmlFor="valid">Valid Input</Label>
        <Input 
          id="valid"
          type="email" 
          placeholder="valid@example.com"
          defaultValue="user@example.com"
          className="ring-2 ring-green-500"
        />
        <p className="text-sm text-green-400">✓ Email format is valid</p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="invalid">Invalid Input</Label>
        <Input 
          id="invalid"
          type="email" 
          placeholder="invalid email"
          defaultValue="invalid-email"
          className="ring-2 ring-red-500"
        />
        <p className="text-sm text-red-400">✗ Please enter a valid email address</p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="warning">Warning State</Label>
        <Input 
          id="warning"
          type="password" 
          placeholder="weak password"
          defaultValue="123"
          className="ring-2 ring-yellow-500"
        />
        <p className="text-sm text-yellow-400">⚠ Password is too weak</p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Examples of different validation states with color coding.',
      },
    },
  },
};

// Responsive test
export const ResponsiveTest: Story = {
  render: () => (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-semibold text-foreground">Responsive Input Behavior</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Mobile Optimized</Label>
          <Input 
            type="text" 
            placeholder="Base text size on mobile"
            className="text-base md:text-sm"
          />
          <p className="text-sm text-muted-foreground">
            Larger text on mobile for better usability
          </p>
        </div>
        
        <div className="space-y-2">
          <Label>Full Width</Label>
          <Input 
            type="email" 
            placeholder="Responsive width"
            className="w-full"
          />
          <p className="text-sm text-muted-foreground">
            Adapts to container width
          </p>
        </div>
      </div>
    </div>
  ),
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
    docs: {
      description: {
        story: 'Test input responsiveness across different screen sizes.',
      },
    },
  },
};

// Accessibility test
export const AccessibilityTest: Story = {
  render: () => (
    <div className="space-y-6 w-96">
      <h3 className="text-lg font-semibold text-foreground">Accessibility Features</h3>
      
      <div className="space-y-2">
        <Label htmlFor="accessible-required">Required Field *</Label>
        <Input 
          id="accessible-required"
          type="text" 
          placeholder="This field is required"
          required
          aria-required="true"
          aria-describedby="required-help"
        />
        <p id="required-help" className="text-sm text-muted-foreground">
          This field must be completed before submitting
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="accessible-error">Field with Error</Label>
        <Input 
          id="accessible-error"
          type="email" 
          placeholder="Enter valid email"
          defaultValue="invalid"
          aria-invalid="true"
          aria-describedby="error-message"
          className="ring-2 ring-red-500"
        />
        <p id="error-message" className="text-sm text-red-400" role="alert">
          Please enter a valid email address
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="accessible-help">Field with Help Text</Label>
        <Input 
          id="accessible-help"
          type="password" 
          placeholder="Secure password"
          aria-describedby="password-help"
        />
        <p id="password-help" className="text-sm text-muted-foreground">
          Password must be at least 8 characters with uppercase, lowercase, and numbers
        </p>
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