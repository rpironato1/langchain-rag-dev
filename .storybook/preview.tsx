import type { Preview } from '@storybook/nextjs';
import React, { Suspense } from 'react';
import '../app/globals.css';

// Loading component for lazy stories
const StoryLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [
        {
          name: 'dark',
          value: 'hsl(224, 71%, 4%)',
        },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // Lazy loading options
    lazyCompilation: true,
    docs: {
      story: {
        inline: false, // Load stories in iframe for better isolation
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-background text-foreground font-sans antialiased">
        <Suspense fallback={<StoryLoader />}>
          <Story />
        </Suspense>
      </div>
    ),
  ],
  // Global loader for all stories
  loaders: [
    async () => {
      // Simulate lazy loading delay in development
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return {};
    },
  ],
};

export default preview;