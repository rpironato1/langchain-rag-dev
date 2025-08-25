import { test, expect } from '@playwright/test';

test.describe('LLM Provider API', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should list available LLM providers', async ({ page }) => {
    const response = await page.request.get('/api/llm/providers');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('providers');
    expect(data).toHaveProperty('total');
    expect(Array.isArray(data.providers)).toBe(true);
    expect(typeof data.total).toBe('number');

    // Verify provider structure
    if (data.providers.length > 0) {
      const provider = data.providers[0];
      expect(provider).toHaveProperty('provider');
      expect(provider).toHaveProperty('available');
      expect(provider).toHaveProperty('config');
      expect(typeof provider.available).toBe('boolean');
    }
  });

  test('should list all providers including unavailable ones', async ({ page }) => {
    const response = await page.request.get('/api/llm/providers?includeUnavailable=true');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('providers');
    expect(data.total).toBeGreaterThanOrEqual(6); // At least 6 providers: openai, anthropic, gemini, openrouter, ollama, lmstudio

    // Verify all expected providers are present
    const providerNames = data.providers.map(p => p.provider);
    expect(providerNames).toContain('openai');
    expect(providerNames).toContain('anthropic');
    expect(providerNames).toContain('gemini');
    expect(providerNames).toContain('openrouter');
    expect(providerNames).toContain('ollama');
    expect(providerNames).toContain('lmstudio');
  });

  test('should validate a specific provider', async ({ page }) => {
    const response = await page.request.post('/api/llm/providers', {
      data: {
        provider: 'openai'
      }
    });
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('provider', 'openai');
    expect(data).toHaveProperty('available');
    expect(data).toHaveProperty('config');
    expect(data).toHaveProperty('message');
    expect(typeof data.available).toBe('boolean');
  });

  test('should return error for invalid provider', async ({ page }) => {
    const response = await page.request.post('/api/llm/providers', {
      data: {
        provider: 'invalid-provider'
      }
    });
    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toContain('Unknown provider');
  });

  test('should return error for missing provider parameter', async ({ page }) => {
    const response = await page.request.post('/api/llm/providers', {
      data: {}
    });
    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toContain('Provider parameter is required');
  });

  test('should handle provider configuration correctly', async ({ page }) => {
    const response = await page.request.get('/api/llm/providers');
    const data = await response.json();

    // Test each provider configuration
    for (const providerInfo of data.providers) {
      const config = providerInfo.config;
      expect(config).toHaveProperty('models');
      expect(config).toHaveProperty('defaultModel');
      expect(config).toHaveProperty('requiresApiKey');
      expect(config).toHaveProperty('supportsStreaming');
      
      expect(Array.isArray(config.models)).toBe(true);
      expect(config.models.length).toBeGreaterThan(0);
      expect(typeof config.defaultModel).toBe('string');
      expect(config.models).toContain(config.defaultModel);
      expect(typeof config.requiresApiKey).toBe('boolean');
      expect(typeof config.supportsStreaming).toBe('boolean');
    }
  });

  test('should validate OpenAI provider models', async ({ page }) => {
    const response = await page.request.post('/api/llm/providers', {
      data: { provider: 'openai' }
    });
    
    const data = await response.json();
    const config = data.config;
    
    expect(config.models).toContain('gpt-4o-mini');
    expect(config.models).toContain('gpt-4o');
    expect(config.defaultModel).toBe('gpt-4o-mini');
    expect(config.requiresApiKey).toBe(true);
    expect(config.supportsStreaming).toBe(true);
  });

  test('should validate Anthropic provider models', async ({ page }) => {
    const response = await page.request.post('/api/llm/providers', {
      data: { provider: 'anthropic' }
    });
    
    const data = await response.json();
    const config = data.config;
    
    expect(config.models).toContain('claude-3-5-sonnet-20241022');
    expect(config.defaultModel).toBe('claude-3-5-sonnet-20241022');
    expect(config.requiresApiKey).toBe(true);
    expect(config.supportsStreaming).toBe(true);
  });

  test('should validate Gemini provider models', async ({ page }) => {
    const response = await page.request.post('/api/llm/providers', {
      data: { provider: 'gemini' }
    });
    
    const data = await response.json();
    const config = data.config;
    
    expect(config.models).toContain('gemini-1.5-flash');
    expect(config.defaultModel).toBe('gemini-1.5-flash');
    expect(config.requiresApiKey).toBe(true);
    expect(config.supportsStreaming).toBe(true);
  });

  test('should validate Ollama provider configuration', async ({ page }) => {
    const response = await page.request.post('/api/llm/providers', {
      data: { provider: 'ollama' }
    });
    
    const data = await response.json();
    const config = data.config;
    
    expect(config.models).toContain('llama3.2');
    expect(config.defaultModel).toBe('llama3.2');
    expect(config.requiresApiKey).toBe(false);
    expect(config.supportsStreaming).toBe(true);
    expect(config.baseURL).toBe('http://localhost:11434');
  });

  test('should validate LM Studio provider configuration', async ({ page }) => {
    const response = await page.request.post('/api/llm/providers', {
      data: { provider: 'lmstudio' }
    });
    
    const data = await response.json();
    const config = data.config;
    
    expect(config.models).toContain('local-model');
    expect(config.defaultModel).toBe('local-model');
    expect(config.requiresApiKey).toBe(false);
    expect(config.supportsStreaming).toBe(true);
    expect(config.baseURL).toBe('http://localhost:1234/v1');
  });

  test('should validate OpenRouter provider configuration', async ({ page }) => {
    const response = await page.request.post('/api/llm/providers', {
      data: { provider: 'openrouter' }
    });
    
    const data = await response.json();
    const config = data.config;
    
    expect(config.models).toContain('openai/gpt-4o-mini');
    expect(config.defaultModel).toBe('openai/gpt-4o-mini');
    expect(config.requiresApiKey).toBe(true);
    expect(config.supportsStreaming).toBe(true);
    expect(config.baseURL).toBe('https://openrouter.ai/api/v1');
  });
});

test.describe('LLM Provider API Performance', () => {
  test('should respond within acceptable time limits', async ({ page }) => {
    const startTime = Date.now();
    const response = await page.request.get('/api/llm/providers');
    const endTime = Date.now();
    
    expect(response.status()).toBe(200);
    expect(endTime - startTime).toBeLessThan(1000); // Should respond within 1 second
  });

  test('should handle concurrent requests', async ({ page }) => {
    const requests = Array(5).fill(0).map(() => 
      page.request.get('/api/llm/providers')
    );
    
    const responses = await Promise.all(requests);
    
    for (const response of responses) {
      expect(response.status()).toBe(200);
    }
  });
});