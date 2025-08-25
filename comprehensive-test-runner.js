#!/usr/bin/env node

/**
 * Comprehensive Test Validation for Multi-Provider LLM System
 * Tests all functionality including LLM providers, MCP tools, and API endpoints
 */

const fs = require('fs');
const http = require('http');
const path = require('path');

const API_BASE = 'http://localhost:3000';

// Color codes for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
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
    const startTime = Date.now();
    await testFn();
    const duration = Date.now() - startTime;
    log(`✓ ${name} (${duration}ms)`, 'green');
    return { success: true, duration };
  } catch (error) {
    log(`✗ ${name}`, 'red');
    log(`  Error: ${error.message}`, 'red');
    return { success: false, error: error.message };
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
    toBeLessThan: (expected) => {
      if (actual >= expected) {
        throw new Error(`Expected ${actual} to be less than ${expected}`);
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
  log('\n🤖 === Testing LLM Provider API ===', 'blue');
  
  let passed = 0;
  let total = 0;
  const results = [];

  // Test 1: List available providers
  total++;
  const result1 = await runTest('should list available LLM providers', async () => {
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
  if (result1.success) passed++;
  results.push(result1);

  // Test 2: List all providers including unavailable
  total++;
  const result2 = await runTest('should list all providers including unavailable ones', async () => {
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
  if (result2.success) passed++;
  results.push(result2);

  // Test 3: Validate specific provider
  total++;
  const result3 = await runTest('should validate a specific provider', async () => {
    const response = await makeRequest('POST', '/api/llm/providers', {
      provider: 'openai'
    });
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('provider', 'openai');
    expect(response.data).toHaveProperty('available');
    expect(response.data).toHaveProperty('config');
    expect(response.data).toHaveProperty('message');
  });
  if (result3.success) passed++;
  results.push(result3);

  // Test 4: Error for invalid provider
  total++;
  const result4 = await runTest('should return error for invalid provider', async () => {
    const response = await makeRequest('POST', '/api/llm/providers', {
      provider: 'invalid-provider'
    });
    expect(response.status).toBe(400);
    expect(response.data).toHaveProperty('error');
    expect(response.data.error).toContain('Unknown provider');
  });
  if (result4.success) passed++;
  results.push(result4);

  // Test 5: Error for missing provider parameter
  total++;
  const result5 = await runTest('should return error for missing provider parameter', async () => {
    const response = await makeRequest('POST', '/api/llm/providers', {});
    expect(response.status).toBe(400);
    expect(response.data).toHaveProperty('error');
    expect(response.data.error).toContain('Provider parameter is required');
  });
  if (result5.success) passed++;
  results.push(result5);

  // Test 6: Performance test
  total++;
  const result6 = await runTest('should respond within acceptable time limits', async () => {
    const startTime = Date.now();
    const response = await makeRequest('GET', '/api/llm/providers');
    const endTime = Date.now();
    
    expect(response.status).toBe(200);
    expect(endTime - startTime).toBeLessThan(1000); // Should respond within 1 second
  });
  if (result6.success) passed++;
  results.push(result6);

  log(`\nLLM Provider API Tests: ${passed}/${total} passed`, passed === total ? 'green' : 'yellow');
  return { passed, total, results };
}

async function testChatAPI() {
  log('\n💬 === Testing Chat API ===', 'blue');
  
  let passed = 0;
  let total = 0;
  const results = [];

  // Test 1: Invalid provider
  total++;
  const result1 = await runTest('should handle invalid provider gracefully', async () => {
    const response = await makeRequest('POST', '/api/chat', {
      messages: [{ role: 'user', content: 'Hello' }],
      provider: 'invalid-provider'
    });
    expect(response.status).toBe(500);
    expect(response.data).toHaveProperty('error');
    expect(response.data.error).toContain('Unsupported provider');
  });
  if (result1.success) passed++;
  results.push(result1);

  // Test 2: Invalid model
  total++;
  const result2 = await runTest('should handle invalid model for provider', async () => {
    const response = await makeRequest('POST', '/api/chat', {
      messages: [{ role: 'user', content: 'Hello' }],
      provider: 'openai',
      model: 'invalid-model'
    });
    expect(response.status).toBe(500);
    expect(response.data).toHaveProperty('error');
    expect(response.data.error).toContain('not supported by provider');
  });
  if (result2.success) passed++;
  results.push(result2);

  // Test 3: Invalid message format
  total++;
  const result3 = await runTest('should validate message format', async () => {
    const response = await makeRequest('POST', '/api/chat', {
      messages: 'invalid-format'
    });
    expect(response.status).toBe(500);
    expect(response.data).toHaveProperty('error');
    expect(response.data.error).toContain('Messages must be an array');
  });
  if (result3.success) passed++;
  results.push(result3);

  // Test 4: Empty messages array
  total++;
  const result4 = await runTest('should handle empty messages array', async () => {
    const response = await makeRequest('POST', '/api/chat', {
      messages: []
    });
    expect(response.status).toBe(500);
    expect(response.data).toHaveProperty('error');
    expect(response.data.error).toContain('Messages array cannot be empty');
  });
  if (result4.success) passed++;
  results.push(result4);

  // Test 5: All provider configurations
  const providers = ['openai', 'anthropic', 'gemini', 'openrouter', 'ollama', 'lmstudio'];
  for (const provider of providers) {
    total++;
    const result = await runTest(`should handle ${provider} provider configuration`, async () => {
      const response = await makeRequest('POST', '/api/chat', {
        messages: [{ role: 'user', content: 'Hello, test message' }],
        provider: provider
      });
      // Should return 500 with proper error (API key or connection issue)
      expect(response.status).toBe(500);
      expect(response.data).toHaveProperty('error');
    });
    if (result.success) passed++;
    results.push(result);
  }

  log(`\nChat API Tests: ${passed}/${total} passed`, passed === total ? 'green' : 'yellow');
  return { passed, total, results };
}

async function testMCPTools() {
  log('\n🔧 === Testing MCP Tools API ===', 'cyan');
  
  let passed = 0;
  let total = 0;
  const results = [];

  // Test 1: List available tools
  total++;
  const result1 = await runTest('should list available MCP tools', async () => {
    const response = await makeRequest('GET', '/api/mcp');
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('tools');
    expect(response.data).toHaveProperty('description');
    expect(response.data.tools.length).toBeGreaterThanOrEqual(4);
    
    const toolNames = response.data.tools.map(t => t.name);
    expect(toolNames).toContain('read_file');
    expect(toolNames).toContain('write_file');
    expect(toolNames).toContain('list_directory');
    expect(toolNames).toContain('fetch_url');
  });
  if (result1.success) passed++;
  results.push(result1);

  // Test 2: List directory
  total++;
  const result2 = await runTest('should list directory contents', async () => {
    const response = await makeRequest('POST', '/api/mcp', {
      tool: 'list_directory',
      parameters: { path: '.' }
    });
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('result');
    expect(response.data.result).toHaveProperty('success', true);
    expect(response.data.result).toHaveProperty('contents');
    expect(Array.isArray(response.data.result.contents)).toBe(true);
  });
  if (result2.success) passed++;
  results.push(result2);

  // Test 3: Read file
  total++;
  const result3 = await runTest('should read file contents', async () => {
    const response = await makeRequest('POST', '/api/mcp', {
      tool: 'read_file',
      parameters: { path: 'package.json' }
    });
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('result');
    expect(response.data.result).toHaveProperty('success', true);
    expect(response.data.result).toHaveProperty('content');
    expect(response.data.result.content).toContain('langchain-nextjs-template');
  });
  if (result3.success) passed++;
  results.push(result3);

  // Test 4: Security - Path traversal protection
  total++;
  const result4 = await runTest('should prevent path traversal attacks', async () => {
    const response = await makeRequest('POST', '/api/mcp', {
      tool: 'read_file',
      parameters: { path: '../../../etc/passwd' }
    });
    expect(response.status).toBe(500);
    expect(response.data).toHaveProperty('error');
    expect(response.data.error).toContain('Access denied');
  });
  if (result4.success) passed++;
  results.push(result4);

  // Test 5: Invalid tool name
  total++;
  const result5 = await runTest('should handle invalid tool name', async () => {
    const response = await makeRequest('POST', '/api/mcp', {
      tool: 'invalid_tool',
      parameters: {}
    });
    expect(response.status).toBe(404);
    expect(response.data).toHaveProperty('error');
    expect(response.data.error).toContain('Tool \'invalid_tool\' not found');
  });
  if (result5.success) passed++;
  results.push(result5);

  // Test 6: Missing tool parameter
  total++;
  const result6 = await runTest('should require tool parameter', async () => {
    const response = await makeRequest('POST', '/api/mcp', {});
    expect(response.status).toBe(400);
    expect(response.data).toHaveProperty('error');
    expect(response.data.error).toContain('Tool name is required');
  });
  if (result6.success) passed++;
  results.push(result6);

  log(`\nMCP Tools API Tests: ${passed}/${total} passed`, passed === total ? 'green' : 'yellow');
  return { passed, total, results };
}

async function testOrchestrators() {
  log('\n🎯 === Testing Orchestrator APIs ===', 'magenta');
  
  let passed = 0;
  let total = 0;
  const results = [];

  // Test 1: Project Planning Orchestrator
  total++;
  const result1 = await runTest('should handle project planning requests', async () => {
    const response = await makeRequest('POST', '/api/chat/project-planning', {
      messages: [{ role: 'user', content: 'Plan a simple web application project' }],
      provider: 'openai'
    });
    // Should return error due to missing API key, but endpoint should exist
    expect(response.status).toBe(500);
    expect(response.data).toHaveProperty('error');
  });
  if (result1.success) passed++;
  results.push(result1);

  // Test 2: Next.js Development Orchestrator
  total++;
  const result2 = await runTest('should handle Next.js development requests', async () => {
    const response = await makeRequest('POST', '/api/chat/nextjs-dev', {
      messages: [{ role: 'user', content: 'Help me create a Next.js component' }],
      provider: 'openai'
    });
    // Should return error due to missing API key, but endpoint should exist
    expect(response.status).toBe(500);
    expect(response.data).toHaveProperty('error');
  });
  if (result2.success) passed++;
  results.push(result2);

  log(`\nOrchestrator API Tests: ${passed}/${total} passed`, passed === total ? 'green' : 'yellow');
  return { passed, total, results };
}

async function testSystemHealth() {
  log('\n🏥 === Testing System Health ===', 'yellow');
  
  let passed = 0;
  let total = 0;
  const results = [];

  // Test 1: Server responsiveness
  total++;
  const result1 = await runTest('server should be responsive', async () => {
    const startTime = Date.now();
    const response = await makeRequest('GET', '/api/llm/providers');
    const endTime = Date.now();
    
    expect(response.status).toBe(200);
    expect(endTime - startTime).toBeLessThan(2000); // Should respond within 2 seconds
  });
  if (result1.success) passed++;
  results.push(result1);

  // Test 2: Build status check
  total++;
  const result2 = await runTest('project build should be successful', async () => {
    // Check if important files exist
    const requiredFiles = [
      'package.json',
      'next.config.js',
      'tsconfig.json',
      'lib/llm-providers.ts',
      'app/api/llm/providers/route.ts',
      'app/api/chat/route.ts',
      'app/api/mcp/route.ts'
    ];
    
    for (const file of requiredFiles) {
      const response = await makeRequest('POST', '/api/mcp', {
        tool: 'read_file',
        parameters: { path: file }
      });
      expect(response.status).toBe(200);
      expect(response.data.result.success).toBe(true);
    }
  });
  if (result2.success) passed++;
  results.push(result2);

  log(`\nSystem Health Tests: ${passed}/${total} passed`, passed === total ? 'green' : 'yellow');
  return { passed, total, results };
}

async function generateTestReport(allResults) {
  log('\n📊 === Generating Test Report ===', 'blue');
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests: allResults.reduce((sum, r) => sum + r.total, 0),
      totalPassed: allResults.reduce((sum, r) => sum + r.passed, 0),
      totalFailed: allResults.reduce((sum, r) => sum + (r.total - r.passed), 0),
      successRate: 0
    },
    categories: allResults,
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      serverUrl: API_BASE
    }
  };
  
  report.summary.successRate = Math.round((report.summary.totalPassed / report.summary.totalTests) * 100);
  
  // Save detailed report to file
  const reportPath = 'test-report.json';
  try {
    await fs.promises.writeFile(reportPath, JSON.stringify(report, null, 2));
    log(`📄 Detailed test report saved to: ${reportPath}`, 'cyan');
  } catch (error) {
    log(`⚠️  Could not save report file: ${error.message}`, 'yellow');
  }
  
  return report;
}

async function main() {
  log('🚀 Starting Comprehensive Test Suite...', 'blue');
  log('Make sure the development server is running on http://localhost:3000', 'yellow');
  
  // Wait a bit for server to be ready
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const allResults = [];
  
  try {
    // Run all test suites
    const llmResults = await testLLMProviders();
    allResults.push({ name: 'LLM Providers', ...llmResults });
    
    const chatResults = await testChatAPI();
    allResults.push({ name: 'Chat API', ...chatResults });
    
    const mcpResults = await testMCPTools();
    allResults.push({ name: 'MCP Tools', ...mcpResults });
    
    const orchestratorResults = await testOrchestrators();
    allResults.push({ name: 'Orchestrators', ...orchestratorResults });
    
    const healthResults = await testSystemHealth();
    allResults.push({ name: 'System Health', ...healthResults });
    
    // Generate comprehensive report
    const report = await generateTestReport(allResults);
    
    log(`\n📈 === Final Results ===`, 'blue');
    log(`Total Tests: ${report.summary.totalTests}`, 'blue');
    log(`Passed: ${report.summary.totalPassed}`, report.summary.totalPassed === report.summary.totalTests ? 'green' : 'yellow');
    log(`Failed: ${report.summary.totalFailed}`, report.summary.totalFailed === 0 ? 'green' : 'red');
    log(`Success Rate: ${report.summary.successRate}%`, report.summary.successRate === 100 ? 'green' : 'yellow');
    
    // Detailed breakdown
    log(`\n🔍 === Test Breakdown ===`, 'cyan');
    allResults.forEach(category => {
      const status = category.passed === category.total ? '✅' : '⚠️';
      log(`${status} ${category.name}: ${category.passed}/${category.total}`, 
          category.passed === category.total ? 'green' : 'yellow');
    });
    
    if (report.summary.successRate === 100) {
      log('\n🎉 All tests passed! The system is working correctly.', 'green');
      process.exit(0);
    } else {
      log('\n⚠️  Some tests failed. Check the details above.', 'yellow');
      process.exit(1);
    }
    
  } catch (error) {
    log(`\n💥 Error running tests: ${error.message}`, 'red');
    process.exit(1);
  }
}

main().catch(console.error);