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
  serverExternalPackages: [
    '@langchain/anthropic',
    '@langchain/google-genai', 
    '@langchain/ollama',
  ],
  // Webpack configuration for LLM providers
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Handle dynamic imports for LLM providers
      config.externals = config.externals || [];
      config.externals.push({
        '@anthropic-ai/sdk': 'commonjs @anthropic-ai/sdk',
        '@google/generative-ai': 'commonjs @google/generative-ai',
        'ollama': 'commonjs ollama',
      });
    }
    return config;
  },
};

module.exports = withBundleAnalyzer(nextConfig)