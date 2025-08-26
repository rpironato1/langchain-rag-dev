const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      // Enable Turbopack for development (simplified config)
    },
    // Enable lazy loading for better performance
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  // ESLint configuration to ignore Storybook files during build
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['app', 'components', 'lib', 'utils'],
  },
  // External packages that should not be bundled by Vercel
  serverExternalPackages: [
    '@langchain/anthropic',
    '@langchain/google-genai', 
    '@langchain/ollama',
    '@langchain/openai',
    '@langchain/core',
    '@langchain/community',
    'langchain',
    '@anthropic-ai/sdk',
    '@google/generative-ai',
    'ollama',
  ],
  // Webpack configuration for better Vercel compatibility and lazy loading
  webpack: (config, { isServer, dev }) => {
    // Enhanced code splitting and lazy loading
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        minRemainingSize: 0,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        enforceSizeThreshold: 50000,
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
          // Separate chunk for Storybook files (won't be loaded in production)
          storybook: {
            test: /[\\/](stories|\.storybook)[\\/]/,
            name: 'storybook',
            priority: 20,
            chunks: 'async',
            enforce: true,
          },
          // Separate chunks for different page routes
          dashboard: {
            test: /[\\/]app[\\/]dashboard[\\/]/,
            name: 'dashboard',
            priority: 10,
            chunks: 'async',
          },
          chat: {
            test: /[\\/]app[\\/]chat[\\/]/,
            name: 'chat',
            priority: 10,
            chunks: 'async',
          },
          components: {
            test: /[\\/]components[\\/]/,
            name: 'components',
            priority: 5,
            chunks: 'async',
            minChunks: 2,
          },
        },
      },
    };

    if (isServer) {
      // Handle dynamic imports for LLM providers
      config.externals = config.externals || [];
      
      // Add externals for better serverless compatibility
      const externals = [
        '@anthropic-ai/sdk',
        '@google/generative-ai',
        'ollama',
        'hnswlib-node',
        'tiktoken',
        'cpu-features',
        '@tensorflow/tfjs-node',
        'sharp'
      ];
      
      externals.forEach(external => {
        config.externals.push({
          [external]: `commonjs ${external}`,
        });
      });
      
      // Ensure compatibility with dynamic imports
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    
    // Ignore specific warnings that don't affect functionality
    config.ignoreWarnings = [
      { module: /node_modules\/node-fetch\/lib\/index\.js/ },
      { module: /node_modules\/punycode\// },
      // Ignore Storybook warnings in production
      { module: /[\\/](stories|\.storybook)[\\/]/ },
    ];
    
    // Exclude Storybook files from production builds
    if (!dev && !config.plugins) {
      config.plugins = [];
    }
    
    return config;
  },
  // Optimize images
  images: {
    domains: [],
    unoptimized: true,
  },
  // Compression and optimization
  compress: true,
  // Build-time optimizations
  output: 'standalone',
  // Environment-specific optimizations
  ...(process.env.NODE_ENV === 'production' && {
    generateEtags: false,
    poweredByHeader: false,
  }),
};

module.exports = withBundleAnalyzer(nextConfig)