import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  stories: [
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-actions",
    "@storybook/addon-viewport"
  ],
  framework: {
    name: "@storybook/nextjs",
    options: {}
  },
  staticDirs: ["../public"],
  docs: {
    autodocs: "tag"
  },
  // Lazy loading configuration for stories
  features: {
    storyStoreV7: true, // Enable story store v7 for better performance
    buildStoriesJson: true, // Enable lazy loading of stories
  },
  // Webpack configuration for lazy loading
  webpackFinal: async (config, { configType }) => {
    // Enable dynamic imports and code splitting
    if (configType === 'PRODUCTION') {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
            stories: {
              test: /[\\/]stories[\\/]/,
              name: 'stories',
              chunks: 'async',
              enforce: true,
            },
          },
        },
      };
    }
    
    return config;
  },
  // Performance optimizations
  typescript: {
    check: false, // Disable typescript check for faster builds
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
};

export default config;