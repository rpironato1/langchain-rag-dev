# Vercel Deployment Guide

## Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/rpironato1/langchain-rag-dev)

## Environment Variables

Configure these environment variables in your Vercel dashboard:

### Required for OpenAI (default provider)
```bash
OPENAI_API_KEY="your_openai_api_key"
```

### Optional - Additional LLM Providers
```bash
# Anthropic Claude
ANTHROPIC_API_KEY="your_anthropic_api_key"

# Google Gemini  
GOOGLE_API_KEY="your_google_api_key"

# OpenRouter (multi-provider)
OPENROUTER_API_KEY="your_openrouter_api_key"

# Local providers (for development)
OLLAMA_BASE_URL="http://localhost:11434"
LMSTUDIO_BASE_URL="http://localhost:1234/v1"
```

### System Configuration
```bash
LANGCHAIN_CALLBACKS_BACKGROUND=false
DEFAULT_LLM_PROVIDER="openai"
```

## Deployment Features

✅ **Optimized for Vercel Serverless Functions**
- All API routes use Node.js runtime for maximum compatibility
- Comprehensive webpack configuration for LangChain dependencies
- External packages properly configured to prevent bundling issues

✅ **Multi-Provider LLM Support**
- 6 LLM providers: OpenAI, Anthropic, Gemini, OpenRouter, Ollama, LM Studio
- Automatic provider detection based on available API keys
- Graceful fallbacks and error handling

✅ **Production Ready**
- Build optimizations for smaller bundle sizes
- Static page generation where possible
- Comprehensive error handling and logging

## Troubleshooting

### Common Issues
1. **Build Failures**: Ensure all environment variables are set
2. **API Timeouts**: Function timeout is set to 30 seconds for LLM requests
3. **Import Errors**: All dynamic imports are properly configured

### Support
For deployment issues, check the build logs in your Vercel dashboard or open an issue in the repository.