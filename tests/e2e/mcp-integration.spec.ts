/**
 * E2E Tests for MCP (Model Context Protocol) Server Integration
 * Tests MCP tools functionality, security, and integration
 */

import { test, expect, Page } from '@playwright/test';

test.describe('MCP Server Integration E2E Tests', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('/mcp-tools');
    await page.waitForLoadState('networkidle');
  });

  test('should load MCP Tools page and display interface', async () => {
    // Check that the page loads correctly
    await expect(page.getByText('MCP Tools Interface')).toBeVisible();
    
    // Check for tool selection dropdown
    await expect(page.locator('select').or(page.getByRole('combobox'))).toBeVisible();
    
    // Check for execute button
    await expect(page.getByRole('button', { name: /execute/i })).toBeVisible();
  });

  test('should list available MCP tools via API', async () => {
    // Test the API endpoint directly
    const response = await page.request.get('/api/mcp');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('tools');
    expect(Array.isArray(data.tools)).toBeTruthy();
    
    // Should include the expected tools
    const toolNames = data.tools.map((tool: any) => tool.name);
    expect(toolNames).toContain('read_file');
    expect(toolNames).toContain('write_file');
    expect(toolNames).toContain('list_directory');
    expect(toolNames).toContain('fetch_url');
  });

  test('should execute file system operations through MCP tools', async () => {
    // Test creating a temporary file
    const testContent = 'This is a test file created by MCP tools E2E test';
    const testFilePath = './test-mcp-file.txt';

    // Create file using write_file tool
    const writeResponse = await page.request.post('/api/mcp', {
      data: {
        tool: 'write_file',
        parameters: {
          path: testFilePath,
          content: testContent
        }
      }
    });

    expect(writeResponse.status()).toBe(200);
    const writeResult = await writeResponse.json();
    expect(writeResult.result.success).toBeTruthy();

    // Read the file back using read_file tool
    const readResponse = await page.request.post('/api/mcp', {
      data: {
        tool: 'read_file',
        parameters: {
          path: testFilePath
        }
      }
    });

    expect(readResponse.status()).toBe(200);
    const readResult = await readResponse.json();
    expect(readResult.result.success).toBeTruthy();
    expect(readResult.result.content).toBe(testContent);

    // Clean up - delete the test file
    await page.request.post('/api/mcp', {
      data: {
        tool: 'write_file',
        parameters: {
          path: testFilePath,
          content: ''
        }
      }
    });
  });

  test('should list directory contents using MCP tools', async () => {
    // List current directory contents
    const response = await page.request.post('/api/mcp', {
      data: {
        tool: 'list_directory',
        parameters: {
          path: './'
        }
      }
    });

    expect(response.status()).toBe(200);
    const result = await response.json();
    expect(result.result.success).toBeTruthy();
    expect(Array.isArray(result.result.contents)).toBeTruthy();
    
    // Should include common project files
    const fileNames = result.result.contents.map((item: any) => item.name);
    expect(fileNames).toContain('package.json');
    expect(fileNames).toContain('README.md');
  });

  test('should fetch URL content using MCP tools', async () => {
    // Test fetching a public URL
    const response = await page.request.post('/api/mcp', {
      data: {
        tool: 'fetch_url',
        parameters: {
          url: 'https://httpbin.org/get'
        }
      }
    });

    expect(response.status()).toBe(200);
    const result = await response.json();
    expect(result.result.success).toBeTruthy();
    expect(result.result.status).toBe(200);
    expect(result.result.content).toContain('httpbin.org');
  });

  test('should enforce security restrictions for file operations', async () => {
    // Test path traversal protection
    const maliciousPath = '../../../etc/passwd';
    
    const response = await page.request.post('/api/mcp', {
      data: {
        tool: 'read_file',
        parameters: {
          path: maliciousPath
        }
      }
    });

    expect(response.status()).toBe(500);
    const result = await response.json();
    expect(result.error).toContain('Access denied');
  });

  test('should handle invalid tool requests gracefully', async () => {
    // Test with non-existent tool
    const response = await page.request.post('/api/mcp', {
      data: {
        tool: 'invalid_tool_name',
        parameters: {}
      }
    });

    expect(response.status()).toBe(404);
    const result = await response.json();
    expect(result.error).toContain('not found');
  });

  test('should handle missing required parameters', async () => {
    // Test read_file without path parameter
    const response = await page.request.post('/api/mcp', {
      data: {
        tool: 'read_file',
        parameters: {}
      }
    });

    expect(response.status()).toBe(500);
    const result = await response.json();
    expect(result.error).toBeDefined();
  });

  test('should handle malformed requests', async () => {
    // Test with missing tool parameter
    const response = await page.request.post('/api/mcp', {
      data: {
        parameters: { path: './test' }
      }
    });

    expect(response.status()).toBe(400);
    const result = await response.json();
    expect(result.error).toContain('Tool name is required');
  });

  test('should integrate MCP tools with UI interface', async () => {
    // Test the UI interface for MCP tools
    const toolSelect = page.locator('select').or(page.getByRole('combobox')).first();
    await toolSelect.click();
    
    // Should have options for different tools
    const options = page.locator('option').or(page.getByRole('option'));
    const optionCount = await options.count();
    expect(optionCount).toBeGreaterThan(0);

    // Select list_directory tool
    await toolSelect.selectOption({ label: /list.*directory/i });

    // Fill in parameters if there's a parameters input
    const parametersInput = page.locator('textarea, input[type="text"]').filter({ hasText: /parameter/i }).or(
      page.locator('textarea').nth(1)
    );
    
    if (await parametersInput.count() > 0) {
      await parametersInput.fill('{"path": "./"}');
    }

    // Execute the tool
    const executeButton = page.getByRole('button', { name: /execute/i });
    await executeButton.click();

    // Wait for results
    await page.waitForTimeout(2000);

    // Check for results display
    const resultsArea = page.locator('[class*="result"], [class*="output"]').or(
      page.locator('pre, code').filter({ hasText: /success|error/ })
    );
    
    await expect(resultsArea.first()).toBeVisible({ timeout: 5000 });
  });

  test('should handle concurrent MCP tool requests', async () => {
    // Execute multiple tools concurrently
    const requests = [
      page.request.post('/api/mcp', {
        data: { tool: 'list_directory', parameters: { path: './' } }
      }),
      page.request.post('/api/mcp', {
        data: { tool: 'read_file', parameters: { path: './package.json' } }
      }),
      page.request.post('/api/mcp', {
        data: { tool: 'fetch_url', parameters: { url: 'https://httpbin.org/get' } }
      })
    ];

    const responses = await Promise.all(requests);
    
    // All requests should complete successfully
    responses.forEach(response => {
      expect(response.status()).toBe(200);
    });

    const results = await Promise.all(responses.map(r => r.json()));
    results.forEach(result => {
      expect(result.result.success).toBeTruthy();
    });
  });

  test('should validate MCP tool response format', async () => {
    const response = await page.request.post('/api/mcp', {
      data: {
        tool: 'list_directory',
        parameters: { path: './' }
      }
    });

    expect(response.status()).toBe(200);
    const result = await response.json();

    // Validate response structure
    expect(result).toHaveProperty('tool');
    expect(result).toHaveProperty('parameters');
    expect(result).toHaveProperty('result');
    expect(result).toHaveProperty('timestamp');
    
    expect(result.tool).toBe('list_directory');
    expect(result.result).toHaveProperty('success');
    expect(typeof result.timestamp).toBe('string');
  });

  test('should handle large file operations', async () => {
    // Test with a larger file content
    const largeContent = 'A'.repeat(10000); // 10KB of content
    const testFilePath = './large-test-file.txt';

    // Write large file
    const writeResponse = await page.request.post('/api/mcp', {
      data: {
        tool: 'write_file',
        parameters: {
          path: testFilePath,
          content: largeContent
        }
      }
    });

    expect(writeResponse.status()).toBe(200);
    const writeResult = await writeResponse.json();
    expect(writeResult.result.success).toBeTruthy();
    expect(writeResult.result.size).toBe(largeContent.length);

    // Read large file back
    const readResponse = await page.request.post('/api/mcp', {
      data: {
        tool: 'read_file',
        parameters: {
          path: testFilePath
        }
      }
    });

    expect(readResponse.status()).toBe(200);
    const readResult = await readResponse.json();
    expect(readResult.result.success).toBeTruthy();
    expect(readResult.result.content.length).toBe(largeContent.length);

    // Clean up
    await page.request.post('/api/mcp', {
      data: {
        tool: 'write_file',
        parameters: {
          path: testFilePath,
          content: ''
        }
      }
    });
  });

  test('should provide meaningful error messages', async () => {
    // Test reading non-existent file
    const response = await page.request.post('/api/mcp', {
      data: {
        tool: 'read_file',
        parameters: {
          path: './non-existent-file-12345.txt'
        }
      }
    });

    expect(response.status()).toBe(500);
    const result = await response.json();
    expect(result.error).toContain('ENOENT');
  });
});