const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      // Enable Turbopack for development (simplified config)
    },
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
  // Webpack configuration for better Vercel compatibility
  webpack: (config, { isServer, dev }) => {
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
    ];
    
    return config;
  },
  // Optimize images
  images: {
    domains: [],
    unoptimized: true,
  },
};

module.exports = withBundleAnalyzer(nextConfig)