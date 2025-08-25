# Multi-Provider LLM Implementation Guide

## Overview

This implementation provides comprehensive support for multiple LLM providers in the AI-powered development platform, enabling seamless switching between different language models while maintaining consistent functionality across all orchestrators.

## Supported Providers

### 1. OpenAI
- **Models**: GPT-4o, GPT-4o-mini, GPT-4-turbo, GPT-4, GPT-3.5-turbo
- **Default Model**: gpt-4o-mini
- **Configuration**: Requires `OPENAI_API_KEY`
- **Features**: Full streaming support, function calling, vision capabilities

### 2. Anthropic Claude
- **Models**: Claude-3.5-Sonnet, Claude-3.5-Haiku, Claude-3-Opus, Claude-3-Sonnet, Claude-3-Haiku
- **Default Model**: claude-3-5-sonnet-20241022
- **Configuration**: Requires `ANTHROPIC_API_KEY`
- **Features**: Advanced reasoning, long context, safety-focused responses

### 3. Google Gemini
- **Models**: Gemini-2.0-Flash-Exp, Gemini-1.5-Pro, Gemini-1.5-Flash, Gemini-1.0-Pro
- **Default Model**: gemini-1.5-flash
- **Configuration**: Requires `GOOGLE_API_KEY`
- **Features**: Multimodal capabilities, fast responses, integrated search

### 4. OpenRouter
- **Models**: Access to multiple providers through unified API
- **Default Model**: openai/gpt-4o-mini
- **Configuration**: Requires `OPENROUTER_API_KEY`
- **Features**: Provider aggregation, competitive pricing, model diversity

### 5. Ollama (Local)
- **Models**: Llama3.2, Llama3.1, CodeLlama, Mistral, Phi3, Qwen2.5
- **Default Model**: llama3.2
- **Configuration**: Local service at `http://localhost:11434`
- **Features**: Privacy-focused, no API costs, full control

### 6. LM Studio (Local)
- **Models**: Any local model served through LM Studio
- **Default Model**: local-model
- **Configuration**: Local service at `http://localhost:1234/v1`
- **Features**: GUI-based model management, OpenAI-compatible API

## Environment Configuration

```bash
# OpenAI (default)
OPENAI_API_KEY="your_openai_api_key"

# Anthropic Claude
ANTHROPIC_API_KEY="your_anthropic_api_key"

# Google Gemini
GOOGLE_API_KEY="your_google_api_key"

# OpenRouter (multi-provider aggregator)
OPENROUTER_API_KEY="your_openrouter_api_key"

# Local LLM Configuration
# Ollama (default: http://localhost:11434)
OLLAMA_BASE_URL="http://localhost:11434"

# LM Studio (default: http://localhost:1234/v1)
LMSTUDIO_BASE_URL="http://localhost:1234/v1"

# Default provider (optional)
DEFAULT_LLM_PROVIDER="openai"
```

## API Usage

### Provider Management

#### List Available Providers
```bash
GET /api/llm/providers
```

Response:
```json
{
  "providers": [
    {
      "provider": "openai",
      "available": true,
      "config": {
        "models": ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"],
        "defaultModel": "gpt-4o-mini",
        "requiresApiKey": true,
        "supportsStreaming": true
      }
    }
  ],
  "total": 6
}
```

#### Validate Specific Provider
```bash
POST /api/llm/providers
Content-Type: application/json

{
  "provider": "anthropic"
}
```

### Chat with Provider Selection

#### Basic Chat Request
```bash
POST /api/chat
Content-Type: application/json

{
  "messages": [
    {"role": "user", "content": "Hello, world!"}
  ],
  "provider": "anthropic",
  "model": "claude-3-5-sonnet-20241022",
  "temperature": 0.7
}
```

#### Project Planning with Provider
```bash
POST /api/chat/project-planning
Content-Type: application/json

{
  "messages": [
    {"role": "user", "content": "Plan a microservices e-commerce platform"}
  ],
  "provider": "gemini",
  "model": "gemini-1.5-pro",
  "temperature": 0.3
}
```

#### Next.js Development with Provider
```bash
POST /api/chat/nextjs-dev
Content-Type: application/json

{
  "messages": [
    {"role": "user", "content": "Create a Next.js 15 component with TypeScript"}
  ],
  "provider": "openai",
  "model": "gpt-4o",
  "temperature": 0.2
}
```

## UI Integration

### Multi-Provider Chat Interface

Access the multi-provider chat interface at `/llm-providers` to:

- **Select Provider**: Choose from available LLM providers
- **Configure Model**: Select specific models for each provider
- **Adjust Temperature**: Fine-tune response creativity (0.0-2.0)
- **Real-time Status**: View provider availability and configuration
- **Unified Chat**: Consistent interface across all providers

## Code Architecture

### Core Abstraction Layer

```typescript
// lib/llm-providers.ts
export interface LLMConfig {
  provider: LLMProvider;
  model: string;
  temperature?: number;
  maxTokens?: number;
  apiKey?: string;
  baseURL?: string;
}

export async function createChatModel(config: LLMConfig): Promise<BaseChatModel> {
  // Provider-specific model creation with dynamic imports
}
```

### Provider Configuration

```typescript
export const PROVIDER_CONFIGS: Record<LLMProvider, ProviderConfig> = {
  openai: {
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4'],
    defaultModel: 'gpt-4o-mini',
    requiresApiKey: true,
    supportsStreaming: true,
  },
  // ... other providers
};
```

### Dynamic Model Loading

All providers use dynamic imports to avoid build-time dependency issues:

```typescript
case 'anthropic':
  const { ChatAnthropic } = await import("@langchain/anthropic");
  return new ChatAnthropic({
    model: config.model,
    temperature: config.temperature ?? 0.7,
    apiKey,
  });
```

## Orchestrator Enhancements

### Enhanced Project Planning

The project planning orchestrator now supports:

- **Multi-scale Projects**: From simple scripts to enterprise systems
- **Architecture Patterns**: Microservices, monoliths, serverless
- **Technology Stack Recommendations**: Modern and legacy systems
- **Risk Assessment**: Comprehensive project risk analysis
- **Resource Planning**: Team scaling and skill requirements

### Advanced Next.js Development

The Next.js development orchestrator includes:

- **Enterprise Features**: Multi-tenant applications, white-labeling
- **Performance Optimization**: Advanced caching, ISR, edge computing
- **Scalability Patterns**: Monorepo setup, microservices integration
- **Security Best Practices**: Authentication, authorization, compliance
- **Modern Tooling**: Turbopack, testing strategies, CI/CD

## Testing

### Comprehensive Test Suite

```bash
# Run all LLM provider tests
yarn test:llm

# Run specific test categories
yarn test:llm-api        # API endpoint tests
yarn test:llm-providers  # Provider configuration tests
yarn test:llm-chat      # Chat functionality tests
```

### Test Coverage

- **API Tests**: Provider listing, validation, configuration
- **Chat Tests**: Multi-provider message handling, error scenarios
- **Performance Tests**: Response times, concurrent operations
- **Security Tests**: API key validation, error handling
- **Integration Tests**: End-to-end chat workflows

### Example Test

```typescript
test('should handle OpenAI provider chat request', async ({ page }) => {
  const response = await page.request.post('/api/chat', {
    data: {
      messages: [{ role: 'user', content: 'Hello, test message' }],
      provider: 'openai',
      model: 'gpt-4o-mini'
    }
  });

  expect([200, 500]).toContain(response.status());
});
```

## Monorepo & Turbopack Setup

### Next.js Configuration

```javascript
// next.config.js
const nextConfig = {
  experimental: {
    turbo: {
      // Enable Turbopack for development
    },
  },
  serverExternalPackages: [
    '@langchain/anthropic',
    '@langchain/google-genai', 
    '@langchain/ollama',
  ],
};
```

### Development Scripts

```json
{
  "scripts": {
    "dev": "next dev --turbo",
    "dev:webpack": "next dev",
    "build": "next build",
    "test:llm": "playwright test tests/llm"
  }
}
```

## Security Considerations

### API Key Management

- **Environment Variables**: Store all API keys securely
- **Validation**: Check API key availability before model creation
- **Error Handling**: Graceful degradation when providers unavailable
- **Local Providers**: No API keys required for Ollama/LM Studio

### Request Validation

- **Provider Validation**: Ensure valid provider selection
- **Model Validation**: Verify model availability for provider
- **Parameter Validation**: Sanitize temperature and token limits
- **Error Sanitization**: Don't expose internal errors to clients

## Performance Optimization

### Dynamic Loading

- **Lazy Imports**: Providers loaded only when needed
- **Build Optimization**: Reduced bundle size with conditional imports
- **Error Isolation**: Provider failures don't affect others
- **Concurrent Requests**: Multiple providers can be used simultaneously

### Caching Strategy

- **Provider Status**: Cache availability checks
- **Model Lists**: Cache provider configurations
- **Response Caching**: Optional for deterministic requests
- **Connection Pooling**: Reuse connections where possible

## Error Handling

### Provider Fallbacks

```typescript
export function parseProviderConfig(request?: any): LLMConfig {
  let provider: LLMProvider = 'openai';
  if (requestProvider && requestProvider in PROVIDER_CONFIGS) {
    provider = requestProvider;
  }
  // Fallback to OpenAI for invalid providers
  return { provider, model: PROVIDER_CONFIGS[provider].defaultModel };
}
```

### Graceful Degradation

- **Invalid Providers**: Fallback to OpenAI
- **Missing API Keys**: Clear error messages
- **Network Issues**: Retry logic for transient failures
- **Model Unavailability**: Alternative model suggestions

## Usage Examples

### Simple Chat
```javascript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'Hello!' }],
    provider: 'anthropic'
  })
});
```

### Project Planning
```javascript
const response = await fetch('/api/chat/project-planning', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'Plan a SaaS application' }],
    provider: 'gemini',
    temperature: 0.3
  })
});
```

### Local Development
```javascript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'Code review this function' }],
    provider: 'ollama',
    model: 'codellama'
  })
});
```

## Deployment

### Production Checklist

1. **Environment Variables**: Set all required API keys
2. **Provider Validation**: Test each provider in production
3. **Monitoring**: Set up logging for provider performance
4. **Fallbacks**: Ensure graceful degradation
5. **Rate Limits**: Configure appropriate limits per provider

### Local Development

1. **Install Ollama**: Download and run locally for free inference
2. **Set Up LM Studio**: GUI-based local model management
3. **Configure API Keys**: Add provider keys to `.env.local`
4. **Test Providers**: Use `/llm-providers` page to validate setup

This implementation provides a robust, scalable foundation for multi-provider LLM integration with comprehensive testing, security, and performance considerations.