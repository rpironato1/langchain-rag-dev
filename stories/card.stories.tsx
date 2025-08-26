import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

/**
 * Card component system for displaying grouped content.
 * Built with dark theme optimization and flexible layout options.
 * 
 * ## Components
 * - Card: Main container with border and shadow
 * - CardHeader: Top section for titles and descriptions
 * - CardTitle: Primary heading
 * - CardDescription: Secondary text
 * - CardContent: Main content area
 * - CardFooter: Bottom section for actions
 */
const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible card component system optimized for dark theme with proper spacing and typography.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic card
export const Default: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This is the main content area of the card.</p>
      </CardContent>
      <CardFooter>
        <Button>Action</Button>
      </CardFooter>
    </Card>
  ),
};

// Simple card without all parts
export const Simple: Story = {
  render: () => (
    <Card className="w-80 p-6">
      <h3 className="text-lg font-semibold mb-2">Simple Card</h3>
      <p className="text-muted-foreground">
        A basic card with just content and padding.
      </p>
    </Card>
  ),
};

// Product card example
export const ProductCard: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>LangChain Pro</CardTitle>
            <CardDescription>Advanced AI development platform</CardDescription>
          </div>
          <Badge variant="secondary">Popular</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-3xl font-bold">$29<span className="text-lg font-normal text-muted-foreground">/month</span></div>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center">
              <span className="text-green-400 mr-2">✓</span>
              Unlimited AI conversations
            </li>
            <li className="flex items-center">
              <span className="text-green-400 mr-2">✓</span>
              Advanced RAG capabilities
            </li>
            <li className="flex items-center">
              <span className="text-green-400 mr-2">✓</span>
              Priority support
            </li>
            <li className="flex items-center">
              <span className="text-green-400 mr-2">✓</span>
              Custom integrations
            </li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button className="flex-1">Get Started</Button>
        <Button variant="outline">Learn More</Button>
      </CardFooter>
    </Card>
  ),
};

// User profile card
export const UserProfile: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
            JD
          </div>
          <div>
            <CardTitle className="text-lg">John Doe</CardTitle>
            <CardDescription>AI Engineer</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Projects</span>
            <span className="text-sm font-medium">24</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Completed</span>
            <span className="text-sm font-medium">18</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Success Rate</span>
            <span className="text-sm font-medium text-green-400">75%</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">View Profile</Button>
      </CardFooter>
    </Card>
  ),
};

// Notification card
export const NotificationCard: Story = {
  render: () => (
    <Card className="w-80 border-yellow-500/20 bg-yellow-500/5">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <span className="text-yellow-400">⚠️</span>
          <CardTitle className="text-lg">System Update</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription>
          A new version of the platform is available. Please update to ensure optimal performance.
        </CardDescription>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button size="sm">Update Now</Button>
        <Button variant="ghost" size="sm">Later</Button>
      </CardFooter>
    </Card>
  ),
};

// Stats card
export const StatsCard: Story = {
  render: () => (
    <Card className="w-64">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold">$45,231.89</p>
            <p className="text-xs text-green-400">+20.1% from last month</p>
          </div>
          <div className="text-3xl">💰</div>
        </div>
      </CardContent>
    </Card>
  ),
};

// Card grid layout
export const CardGrid: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🤖 AI Models
          </CardTitle>
          <CardDescription>Manage your AI model configurations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">12</div>
          <p className="text-sm text-muted-foreground">Active models</p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">Manage</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊 Analytics
          </CardTitle>
          <CardDescription>View platform usage statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">2.4K</div>
          <p className="text-sm text-muted-foreground">API calls today</p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">View Details</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔧 Settings
          </CardTitle>
          <CardDescription>Configure platform preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">5</div>
          <p className="text-sm text-muted-foreground">Active integrations</p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">Configure</Button>
        </CardFooter>
      </Card>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Example of cards in a responsive grid layout.',
      },
    },
  },
};

// Responsive test
export const ResponsiveTest: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Responsive Card Behavior</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Mobile First</CardTitle>
            <CardDescription>Stacks vertically on small screens</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">This card adapts to different screen sizes.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Responsive Layout</CardTitle>
            <CardDescription>Side by side on larger screens</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Grid layout adjusts automatically.</p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="w-full max-w-none">
        <CardHeader>
          <CardTitle>Full Width Card</CardTitle>
          <CardDescription>Stretches to container width</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This card demonstrates full-width responsive behavior.</p>
        </CardContent>
      </Card>
    </div>
  ),
  parameters: {
    layout: 'padded',
    viewport: {
      defaultViewport: 'mobile',
    },
    docs: {
      description: {
        story: 'Test card responsiveness across different screen sizes.',
      },
    },
  },
};

// Accessibility test
export const AccessibilityTest: Story = {
  render: () => (
    <div className="space-y-6 max-w-2xl">
      <h3 className="text-lg font-semibold text-foreground">Accessibility Features</h3>
      
      <Card role="article" aria-labelledby="accessible-title">
        <CardHeader>
          <CardTitle id="accessible-title">Accessible Article Card</CardTitle>
          <CardDescription>Proper semantic structure and ARIA labels</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This card uses semantic HTML and ARIA attributes for screen readers.</p>
        </CardContent>
        <CardFooter>
          <Button aria-describedby="accessible-title">Read More</Button>
        </CardFooter>
      </Card>

      <Card 
        role="region" 
        aria-labelledby="interactive-title"
        className="focus-within:ring-2 focus-within:ring-ring"
      >
        <CardHeader>
          <CardTitle id="interactive-title">Interactive Card</CardTitle>
          <CardDescription>Focus management and keyboard navigation</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This card properly manages focus states for interactive elements.</p>
        </CardContent>
        <CardFooter className="gap-2">
          <Button>Primary Action</Button>
          <Button variant="outline">Secondary</Button>
        </CardFooter>
      </Card>
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