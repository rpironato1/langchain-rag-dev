/**
 * E2E Tests for LLM Provider Integration
 * Tests all supported providers (OpenAI, Anthropic, Gemini, OpenRouter, Ollama, LM Studio)
 */

import { test, expect, Page } from '@playwright/test';

test.describe('LLM Provider Integration E2E Tests', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('/llm-providers');
    await page.waitForLoadState('networkidle');
  });

  test('should load LLM providers page with all providers listed', async () => {
    // Check main heading
    await expect(page.getByText('Multi-Provider LLM Chat')).toBeVisible();
    
    // Check provider status section
    await expect(page.getByText('Provider Status')).toBeVisible();
    
    // Verify all expected providers are listed
    await expect(page.getByText('openai')).toBeVisible();
    await expect(page.getByText('anthropic')).toBeVisible();
    await expect(page.getByText('gemini')).toBeVisible();
    await expect(page.getByText('openrouter')).toBeVisible();
    await expect(page.getByText('ollama')).toBeVisible();
    await expect(page.getByText('lmstudio')).toBeVisible();
  });

  test('should show correct provider availability status', async () => {
    // Test the providers API endpoint
    const response = await page.request.get('/api/llm/providers?includeUnavailable=true');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('providers');
    expect(Array.isArray(data.providers)).toBeTruthy();
    
    // Check that providers have availability status
    data.providers.forEach((provider: any) => {
      expect(provider).toHaveProperty('provider');
      expect(provider).toHaveProperty('available');
      expect(provider).toHaveProperty('config');
      expect(typeof provider.available).toBe('boolean');
    });
  });

  test('should validate individual provider configurations', async () => {
    const providers = ['openai', 'anthropic', 'gemini', 'openrouter', 'ollama', 'lmstudio'];
    
    for (const provider of providers) {
      const response = await page.request.post('/api/llm/providers', {
        data: { provider }
      });
      
      expect(response.status()).toBe(200);
      const result = await response.json();
      
      expect(result).toHaveProperty('provider', provider);
      expect(result).toHaveProperty('available');
      expect(result).toHaveProperty('config');
      expect(result).toHaveProperty('message');
      
      // Verify config structure
      expect(result.config).toHaveProperty('models');
      expect(result.config).toHaveProperty('defaultModel');
      expect(result.config).toHaveProperty('requiresApiKey');
      expect(result.config).toHaveProperty('supportsStreaming');
      expect(Array.isArray(result.config.models)).toBeTruthy();
    }
  });

  test('should handle provider selection and model switching', async () => {
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Find and interact with provider selector
    const providerSelect = page.locator('select').or(page.getByRole('combobox')).first();
    await expect(providerSelect).toBeVisible();
    
    // Get available options
    await providerSelect.click();
    
    // Select a different provider (try ollama first as it's usually available)
    const ollamaOption = page.getByText('ollama').or(page.locator('option').filter({ hasText: 'ollama' }));
    if (await ollamaOption.count() > 0) {
      await ollamaOption.click();
      
      // Wait for model selector to update
      await page.waitForTimeout(1000);
      
      // Check that model selector has options
      const modelSelect = page.locator('select').nth(1).or(page.getByRole('combobox').nth(1));
      if (await modelSelect.count() > 0) {
        await expect(modelSelect).toBeVisible();
      }
    }
  });

  test('should display API key configuration interface', async () => {
    // Click configure button for API keys
    const configureButton = page.getByRole('button', { name: /configure/i });
    await configureButton.click();
    
    // Check that API key fields are displayed
    await expect(page.getByText('Openai API Key')).toBeVisible();
    await expect(page.getByText('Anthropic API Key')).toBeVisible();
    await expect(page.getByText('Gemini API Key')).toBeVisible();
    await expect(page.getByText('Openrouter API Key')).toBeVisible();
    
    // Check for helpful links
    await expect(page.getByText('platform.openai.com')).toBeVisible();
    await expect(page.getByText('console.anthropic.com')).toBeVisible();
    await expect(page.getByText('makersuite.google.com')).toBeVisible();
    await expect(page.getByText('openrouter.ai')).toBeVisible();
    
    // Check security notice
    await expect(page.getByText('API keys are stored locally')).toBeVisible();
  });

  test('should handle API key input and storage', async () => {
    // Open API key configuration
    const configureButton = page.getByRole('button', { name: /configure/i });
    await configureButton.click();
    
    // Test OpenAI API key input
    const openaiInput = page.getByPlaceholder(/Enter your openai API key/i);
    const testApiKey = 'sk-test1234567890abcdef';
    
    await openaiInput.fill(testApiKey);
    
    // Click save button
    const saveButton = page.getByRole('button', { name: /save/i }).first();
    await saveButton.click();
    
    // Check that the input is cleared or shows confirmation
    await page.waitForTimeout(1000);
    
    // The key should be stored in localStorage (we can't directly check but the form behavior should indicate success)
    // Check that save button becomes disabled again when input is empty
    await openaiInput.clear();
    await expect(saveButton).toBeDisabled();
  });

  test('should show/hide API keys with toggle button', async () => {
    // Open API key configuration
    const configureButton = page.getByRole('button', { name: /configure/i });
    await configureButton.click();
    
    // Test password field visibility toggle
    const openaiInput = page.getByPlaceholder(/Enter your openai API key/i);
    const toggleButton = page.locator('button').filter({ has: page.locator('svg') }).nth(0);
    
    // Initially should be password type
    await expect(openaiInput).toHaveAttribute('type', 'password');
    
    // Click toggle to show
    await toggleButton.click();
    await expect(openaiInput).toHaveAttribute('type', 'text');
    
    // Click toggle to hide again
    await toggleButton.click();
    await expect(openaiInput).toHaveAttribute('type', 'password');
  });

  test('should validate chat functionality with available provider', async () => {
    // Wait for providers to load
    await page.waitForTimeout(3000);
    
    // Find an available provider (likely ollama or lmstudio in test environment)
    const chatInput = page.getByPlaceholder(/Type your message/);
    
    // Only test if we have an available provider
    const sendButton = page.getByRole('button', { name: 'Send' });
    
    if (!(await sendButton.isDisabled())) {
      // Fill a test message
      await chatInput.fill('Hello, this is a test message');
      
      // Send should be enabled now
      await expect(sendButton).toBeEnabled();
      
      // Send the message
      await sendButton.click();
      
      // Check for loading state
      await expect(page.getByText(/thinking/i).or(page.locator('[class*="loading"]'))).toBeVisible({ timeout: 2000 });
      
      // Wait for response (may take a while for actual LLM)
      await page.waitForTimeout(10000);
      
      // Check that message appears in chat
      await expect(page.getByText('Hello, this is a test message')).toBeVisible();
    }
  });

  test('should handle temperature adjustment', async () => {
    // Find temperature slider
    const temperatureSlider = page.locator('input[type="range"]').or(page.getByRole('slider'));
    await expect(temperatureSlider).toBeVisible();
    
    // Test different temperature values
    await temperatureSlider.fill('0.3');
    await expect(page.getByText('Temperature: 0.3')).toBeVisible();
    
    await temperatureSlider.fill('1.2');
    await expect(page.getByText('Temperature: 1.2')).toBeVisible();
    
    await temperatureSlider.fill('0.7');
    await expect(page.getByText('Temperature: 0.7')).toBeVisible();
  });

  test('should clear chat history', async () => {
    // Add a message first (if possible)
    const chatInput = page.getByPlaceholder(/Type your message/);
    await chatInput.fill('Test message for clearing');
    
    const sendButton = page.getByRole('button', { name: 'Send' });
    if (!(await sendButton.isDisabled())) {
      await sendButton.click();
      await page.waitForTimeout(2000);
    }
    
    // Click clear chat button
    const clearButton = page.getByRole('button', { name: /clear chat/i });
    await clearButton.click();
    
    // Check that chat area shows empty state
    await expect(page.getByText('Start a conversation')).toBeVisible();
  });

  test('should handle invalid provider gracefully', async () => {
    // Test API with invalid provider
    const response = await page.request.post('/api/llm/providers', {
      data: { provider: 'invalid_provider_123' }
    });
    
    expect(response.status()).toBe(400);
    const result = await response.json();
    expect(result.error).toContain('Unknown provider');
  });

  test('should handle missing provider parameter', async () => {
    // Test API without provider parameter
    const response = await page.request.post('/api/llm/providers', {
      data: {}
    });
    
    expect(response.status()).toBe(400);
    const result = await response.json();
    expect(result.error).toContain('Provider parameter is required');
  });

  test('should respond within acceptable time limits', async () => {
    const startTime = Date.now();
    
    const response = await page.request.get('/api/llm/providers');
    expect(response.status()).toBe(200);
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Should respond within 5 seconds
    expect(responseTime).toBeLessThan(5000);
  });

  test('should maintain provider configurations across page refreshes', async () => {
    // Set temperature to a specific value
    const temperatureSlider = page.locator('input[type="range"]');
    await temperatureSlider.fill('0.9');
    
    // Select a specific provider if possible
    const providerSelect = page.locator('select').first();
    await providerSelect.selectOption({ index: 1 });
    
    // Refresh the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Check that temperature was preserved
    await page.waitForTimeout(2000);
    const temperatureText = page.getByText(/Temperature: 0\.9/);
    await expect(temperatureText).toBeVisible();
  });

  test('should show appropriate error messages for unavailable providers', async () => {
    // Test provider availability by trying to validate each one
    const providers = ['openai', 'anthropic', 'gemini', 'openrouter'];
    
    for (const provider of providers) {
      const response = await page.request.post('/api/llm/providers', {
        data: { provider }
      });
      
      expect(response.status()).toBe(200);
      const result = await response.json();
      
      if (!result.available) {
        expect(result.message).toContain('not properly configured');
      } else {
        expect(result.message).toContain('is available');
      }
    }
  });

  test('should display model information correctly', async () => {
    // Check that provider configs include proper model information
    const response = await page.request.get('/api/llm/providers?includeUnavailable=true');
    const data = await response.json();
    
    data.providers.forEach((provider: any) => {
      expect(provider.config.models.length).toBeGreaterThan(0);
      expect(provider.config.defaultModel).toBeTruthy();
      expect(provider.config.models).toContain(provider.config.defaultModel);
      
      // Check model names are reasonable
      provider.config.models.forEach((model: string) => {
        expect(model.length).toBeGreaterThan(0);
        expect(typeof model).toBe('string');
      });
    });
  });
});