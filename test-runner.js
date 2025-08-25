#!/usr/bin/env node

/**
 * Simple API test runner without browser dependencies
 */

const fs = require('fs');
const http = require('http');

const API_BASE = 'http://localhost:3000';

// Color codes for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = body ? JSON.parse(body) : {};
          resolve({
            status: res.statusCode,
            data: jsonBody,
            headers: res.headers
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: body,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTest(name, testFn) {
  try {
    await testFn();
    log(`✓ ${name}`, 'green');
    return true;
  } catch (error) {
    log(`✗ ${name}`, 'red');
    log(`  Error: ${error.message}`, 'red');
    return false;
  }
}

function expect(actual) {
  return {
    toBe: (expected) => {
      if (actual !== expected) {
        throw new Error(`Expected ${actual} to be ${expected}`);
      }
    },
    toContain: (expected) => {
      if (!actual.includes(expected)) {
        throw new Error(`Expected ${actual} to contain ${expected}`);
      }
    },
    toBeGreaterThanOrEqual: (expected) => {
      if (actual < expected) {
        throw new Error(`Expected ${actual} to be greater than or equal to ${expected}`);
      }
    },
    toHaveProperty: (property, value = undefined) => {
      if (!(property in actual)) {
        throw new Error(`Expected object to have property ${property}`);
      }
      if (value !== undefined && actual[property] !== value) {
        throw new Error(`Expected property ${property} to be ${value}, got ${actual[property]}`);
      }
    }
  };
}

async function testLLMProviders() {
  log('\n=== Testing LLM Provider API ===', 'blue');
  
  let passed = 0;
  let total = 0;

  // Test 1: List available providers
  total++;
  const success1 = await runTest('should list available LLM providers', async () => {
    const response = await makeRequest('GET', '/api/llm/providers');
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('providers');
    expect(response.data).toHaveProperty('total');
    
    if (response.data.providers.length > 0) {
      const provider = response.data.providers[0];
      expect(provider).toHaveProperty('provider');
      expect(provider).toHaveProperty('available');
      expect(provider).toHaveProperty('config');
    }
  });
  if (success1) passed++;

  // Test 2: List all providers including unavailable
  total++;
  const success2 = await runTest('should list all providers including unavailable ones', async () => {
    const response = await makeRequest('GET', '/api/llm/providers?includeUnavailable=true');
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('providers');
    expect(response.data.total).toBeGreaterThanOrEqual(6);
    
    const providerNames = response.data.providers.map(p => p.provider);
    expect(providerNames).toContain('openai');
    expect(providerNames).toContain('anthropic');
    expect(providerNames).toContain('gemini');
    expect(providerNames).toContain('openrouter');
    expect(providerNames).toContain('ollama');
    expect(providerNames).toContain('lmstudio');
  });
  if (success2) passed++;

  // Test 3: Validate specific provider
  total++;
  const success3 = await runTest('should validate a specific provider', async () => {
    const response = await makeRequest('POST', '/api/llm/providers', {
      provider: 'openai'
    });
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('provider', 'openai');
    expect(response.data).toHaveProperty('available');
    expect(response.data).toHaveProperty('config');
    expect(response.data).toHaveProperty('message');
  });
  if (success3) passed++;

  // Test 4: Error for invalid provider
  total++;
  const success4 = await runTest('should return error for invalid provider', async () => {
    const response = await makeRequest('POST', '/api/llm/providers', {
      provider: 'invalid-provider'
    });
    expect(response.status).toBe(400);
    expect(response.data).toHaveProperty('error');
    expect(response.data.error).toContain('Unknown provider');
  });
  if (success4) passed++;

  // Test 5: Error for missing provider parameter
  total++;
  const success5 = await runTest('should return error for missing provider parameter', async () => {
    const response = await makeRequest('POST', '/api/llm/providers', {});
    expect(response.status).toBe(400);
    expect(response.data).toHaveProperty('error');
    expect(response.data.error).toContain('Provider parameter is required');
  });
  if (success5) passed++;

  log(`\nLLM Provider API Tests: ${passed}/${total} passed`, passed === total ? 'green' : 'yellow');
  return { passed, total };
}

async function testChatAPI() {
  log('\n=== Testing Chat API ===', 'blue');
  
  let passed = 0;
  let total = 0;

  // Test 1: Invalid provider
  total++;
  const success1 = await runTest('should handle invalid provider gracefully', async () => {
    const response = await makeRequest('POST', '/api/chat', {
      messages: [{ role: 'user', content: 'Hello' }],
      provider: 'invalid-provider'
    });
    expect(response.status).toBe(500);
    expect(response.data).toHaveProperty('error');
    expect(response.data.error).toContain('Unsupported provider');
  });
  if (success1) passed++;

  // Test 2: Invalid model
  total++;
  const success2 = await runTest('should handle invalid model for provider', async () => {
    const response = await makeRequest('POST', '/api/chat', {
      messages: [{ role: 'user', content: 'Hello' }],
      provider: 'openai',
      model: 'invalid-model'
    });
    expect(response.status).toBe(500);
    expect(response.data).toHaveProperty('error');
    expect(response.data.error).toContain('not supported by provider');
  });
  if (success2) passed++;

  // Test 3: Invalid message format
  total++;
  const success3 = await runTest('should validate message format', async () => {
    const response = await makeRequest('POST', '/api/chat', {
      messages: 'invalid-format'
    });
    expect(response.status).toBe(500);
    expect(response.data).toHaveProperty('error');
    expect(response.data.error).toContain('Messages must be an array');
  });
  if (success3) passed++;

  // Test 4: Empty messages array
  total++;
  const success4 = await runTest('should handle empty messages array', async () => {
    const response = await makeRequest('POST', '/api/chat', {
      messages: []
    });
    expect(response.status).toBe(500);
    expect(response.data).toHaveProperty('error');
    expect(response.data.error).toContain('Messages array cannot be empty');
  });
  if (success4) passed++;

  // Test 5: OpenAI without API key
  total++;
  const success5 = await runTest('should handle OpenAI provider without API key', async () => {
    const response = await makeRequest('POST', '/api/chat', {
      messages: [{ role: 'user', content: 'Hello, test message' }],
      provider: 'openai',
      model: 'gpt-4o-mini'
    });
    // Should return 500 with API key error
    expect(response.status).toBe(500);
    expect(response.data).toHaveProperty('error');
    expect(response.data.error).toContain('API key required');
  });
  if (success5) passed++;

  log(`\nChat API Tests: ${passed}/${total} passed`, passed === total ? 'green' : 'yellow');
  return { passed, total };
}

async function main() {
  log('Starting API Tests...', 'blue');
  log('Make sure the development server is running on http://localhost:3000', 'yellow');
  
  // Wait a bit for server to be ready
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  let totalPassed = 0;
  let totalTests = 0;
  
  try {
    const providerResults = await testLLMProviders();
    totalPassed += providerResults.passed;
    totalTests += providerResults.total;
    
    const chatResults = await testChatAPI();
    totalPassed += chatResults.passed;
    totalTests += chatResults.total;
    
  } catch (error) {
    log(`\nError running tests: ${error.message}`, 'red');
    process.exit(1);
  }
  
  log(`\n=== Final Results ===`, 'blue');
  log(`Total Tests: ${totalTests}`, 'blue');
  log(`Passed: ${totalPassed}`, totalPassed === totalTests ? 'green' : 'yellow');
  log(`Failed: ${totalTests - totalPassed}`, totalTests - totalPassed === 0 ? 'green' : 'red');
  
  if (totalPassed === totalTests) {
    log('\n🎉 All tests passed!', 'green');
    process.exit(0);
  } else {
    log('\n❌ Some tests failed', 'red');
    process.exit(1);
  }
}

main().catch(console.error);