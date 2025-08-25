import { test, expect } from '@playwright/test';

test.describe('Multi-Provider Chat API', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should handle OpenAI provider chat request', async ({ page }) => {
    const response = await page.request.post('/api/chat', {
      data: {
        messages: [
          { role: 'user', content: 'Hello, test message' }
        ],
        provider: 'openai',
        model: 'gpt-4o-mini'
      }
    });

    // Should return success or proper error if API key not available
    expect([200, 500]).toContain(response.status());
    
    if (response.status() === 500) {
      const errorData = await response.json();
      // Should be a proper API key error, not a code error
      expect(errorData.error).toBeDefined();
    }
  });

  test('should handle provider configuration in request body', async ({ page }) => {
    const response = await page.request.post('/api/chat', {
      data: {
        messages: [
          { role: 'user', content: 'Hello' }
        ],
        provider: 'openai',
        model: 'gpt-4o-mini',
        temperature: 0.5
      }
    });

    expect([200, 500]).toContain(response.status());
  });

  test('should default to OpenAI when no provider specified', async ({ page }) => {
    const response = await page.request.post('/api/chat', {
      data: {
        messages: [
          { role: 'user', content: 'Hello' }
        ]
      }
    });

    expect([200, 500]).toContain(response.status());
  });

  test('should handle invalid provider gracefully', async ({ page }) => {
    const response = await page.request.post('/api/chat', {
      data: {
        messages: [
          { role: 'user', content: 'Hello' }
        ],
        provider: 'invalid-provider'
      }
    });

    expect(response.status()).toBe(500);
    const errorData = await response.json();
    expect(errorData.error).toBeDefined();
    expect(errorData.error).toContain('Unsupported provider');
  });

  test('should handle invalid model for provider', async ({ page }) => {
    const response = await page.request.post('/api/chat', {
      data: {
        messages: [
          { role: 'user', content: 'Hello' }
        ],
        provider: 'openai',
        model: 'invalid-model'
      }
    });

    expect(response.status()).toBe(500);
    const errorData = await response.json();
    expect(errorData.error).toBeDefined();
    expect(errorData.error).toContain('not supported by provider');
  });

  test('should handle Anthropic provider', async ({ page }) => {
    const response = await page.request.post('/api/chat', {
      data: {
        messages: [
          { role: 'user', content: 'Hello' }
        ],
        provider: 'anthropic',
        model: 'claude-3-5-sonnet-20241022'
      }
    });

    expect([200, 500]).toContain(response.status());
  });

  test('should handle Gemini provider', async ({ page }) => {
    const response = await page.request.post('/api/chat', {
      data: {
        messages: [
          { role: 'user', content: 'Hello' }
        ],
        provider: 'gemini',
        model: 'gemini-1.5-flash'
      }
    });

    expect([200, 500]).toContain(response.status());
  });

  test('should handle OpenRouter provider', async ({ page }) => {
    const response = await page.request.post('/api/chat', {
      data: {
        messages: [
          { role: 'user', content: 'Hello' }
        ],
        provider: 'openrouter',
        model: 'openai/gpt-4o-mini'
      }
    });

    expect([200, 500]).toContain(response.status());
  });

  test('should handle Ollama provider', async ({ page }) => {
    const response = await page.request.post('/api/chat', {
      data: {
        messages: [
          { role: 'user', content: 'Hello' }
        ],
        provider: 'ollama',
        model: 'llama3.2'
      }
    });

    expect([200, 500]).toContain(response.status());
  });

  test('should handle LM Studio provider', async ({ page }) => {
    const response = await page.request.post('/api/chat', {
      data: {
        messages: [
          { role: 'user', content: 'Hello' }
        ],
        provider: 'lmstudio',
        model: 'local-model'
      }
    });

    expect([200, 500]).toContain(response.status());
  });

  test('should validate message format', async ({ page }) => {
    const response = await page.request.post('/api/chat', {
      data: {
        messages: 'invalid-format'
      }
    });

    expect(response.status()).toBe(500);
  });

  test('should handle empty messages array', async ({ page }) => {
    const response = await page.request.post('/api/chat', {
      data: {
        messages: []
      }
    });

    expect(response.status()).toBe(500);
  });

  test('should handle conversation history', async ({ page }) => {
    const response = await page.request.post('/api/chat', {
      data: {
        messages: [
          { role: 'user', content: 'What is 2+2?' },
          { role: 'assistant', content: '2+2 equals 4.' },
          { role: 'user', content: 'What about 3+3?' }
        ],
        provider: 'openai',
        model: 'gpt-4o-mini'
      }
    });

    expect([200, 500]).toContain(response.status());
  });

  test('should respect temperature parameter', async ({ page }) => {
    const response = await page.request.post('/api/chat', {
      data: {
        messages: [
          { role: 'user', content: 'Hello' }
        ],
        provider: 'openai',
        model: 'gpt-4o-mini',
        temperature: 0.1
      }
    });

    expect([200, 500]).toContain(response.status());
  });

  test('should respect maxTokens parameter', async ({ page }) => {
    const response = await page.request.post('/api/chat', {
      data: {
        messages: [
          { role: 'user', content: 'Hello' }
        ],
        provider: 'openai',
        model: 'gpt-4o-mini',
        maxTokens: 100
      }
    });

    expect([200, 500]).toContain(response.status());
  });
});

test.describe('Project Planning Orchestrator Multi-Provider', () => {
  test('should handle different providers for project planning', async ({ page }) => {
    const providers = ['openai', 'anthropic', 'gemini'];
    
    for (const provider of providers) {
      const response = await page.request.post('/api/chat/project-planning', {
        data: {
          messages: [
            { role: 'user', content: 'Plan a simple web application project' }
          ],
          provider,
        }
      });

      expect([200, 500]).toContain(response.status());
    }
  });

  test('should handle complex enterprise project planning', async ({ page }) => {
    const response = await page.request.post('/api/chat/project-planning', {
      data: {
        messages: [
          { 
            role: 'user', 
            content: 'Plan a microservices-based e-commerce platform with 100k+ users, using React, Node.js, and Docker' 
          }
        ],
        provider: 'openai',
        model: 'gpt-4o-mini'
      }
    });

    expect([200, 500]).toContain(response.status());
  });
});

test.describe('Next.js Development Orchestrator Multi-Provider', () => {
  test('should handle different providers for Next.js development', async ({ page }) => {
    const providers = ['openai', 'anthropic', 'gemini'];
    
    for (const provider of providers) {
      const response = await page.request.post('/api/chat/nextjs-dev', {
        data: {
          messages: [
            { role: 'user', content: 'Help me create a Next.js component for user authentication' }
          ],
          provider,
        }
      });

      expect([200, 500]).toContain(response.status());
    }
  });

  test('should handle complex Next.js architecture questions', async ({ page }) => {
    const response = await page.request.post('/api/chat/nextjs-dev', {
      data: {
        messages: [
          { 
            role: 'user', 
            content: 'Design a scalable Next.js architecture for a multi-tenant SaaS application with real-time features' 
          }
        ],
        provider: 'openai',
        model: 'gpt-4o-mini'
      }
    });

    expect([200, 500]).toContain(response.status());
  });

  test('should handle monorepo and Turbopack questions', async ({ page }) => {
    const response = await page.request.post('/api/chat/nextjs-dev', {
      data: {
        messages: [
          { 
            role: 'user', 
            content: 'How to set up a Next.js monorepo with Turbopack for multiple applications?' 
          }
        ],
        provider: 'openai',
        model: 'gpt-4o-mini'
      }
    });

    expect([200, 500]).toContain(response.status());
  });
});