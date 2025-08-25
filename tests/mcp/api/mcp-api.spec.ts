import { test, expect } from '@playwright/test';
import { MCPTestClient } from '../../utils/test-helpers';
import { mockMCPTools, errorTestCases } from '../../utils/mock-data';

test.describe('MCP API Basic Functionality', () => {
  let client: MCPTestClient;

  test.beforeEach(() => {
    client = new MCPTestClient();
  });

  test('should return available tools on GET request', async () => {
    const response = await client.getTools();
    
    expect(response).toBeDefined();
    expect(response.tools).toBeDefined();
    expect(Array.isArray(response.tools)).toBe(true);
    expect(response.tools.length).toBeGreaterThan(0);
    
    // Verify expected tools are present
    const toolNames = response.tools.map(tool => tool.name);
    expect(toolNames).toContain('read_file');
    expect(toolNames).toContain('write_file');
    expect(toolNames).toContain('list_directory');
    expect(toolNames).toContain('fetch_url');
  });

  test('should validate tool schema structure', async () => {
    const response = await client.getTools();
    
    for (const tool of response.tools) {
      expect(tool).toHaveProperty('name');
      expect(tool).toHaveProperty('description');
      expect(tool).toHaveProperty('parameters');
      
      expect(typeof tool.name).toBe('string');
      expect(typeof tool.description).toBe('string');
      expect(typeof tool.parameters).toBe('object');
      
      expect(tool.parameters).toHaveProperty('type');
      expect(tool.parameters).toHaveProperty('properties');
      expect(tool.parameters.type).toBe('object');
      expect(typeof tool.parameters.properties).toBe('object');
    }
  });

  test('should handle invalid JSON in POST request', async () => {
    const response = await fetch('http://localhost:3000/api/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: 'invalid json',
    });
    
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('Invalid request body');
  });

  test('should require tool name in POST request', async () => {
    const response = await fetch('http://localhost:3000/api/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ parameters: {} }),
    });
    
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Tool name is required');
  });

  test('should return 404 for unknown tool', async () => {
    const response = await fetch('http://localhost:3000/api/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tool: 'unknown_tool',
        parameters: {}
      }),
    });
    
    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toContain("Tool 'unknown_tool' not found");
  });

  test('should include timestamp in all responses', async () => {
    const mcpResponse = await client.readFile('./package.json');
    expect(mcpResponse).toBeDefined();
    expect(mcpResponse.tool).toBe('read_file');
    expect(mcpResponse.timestamp).toBeDefined();
    expect(new Date(mcpResponse.timestamp)).toBeInstanceOf(Date);
  });

  test('should preserve parameters in response', async () => {
    const parameters = { path: './package.json' };
    const mcpResponse = await client.readFile(parameters.path);
    
    expect(mcpResponse.parameters).toEqual(parameters);
  });

  test.describe('Error Handling', () => {
    for (const errorCase of errorTestCases) {
      test(`should handle ${errorCase.name}`, async () => {
        const response = await fetch('http://localhost:3000/api/mcp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: typeof errorCase.body === 'string' ? errorCase.body : JSON.stringify(errorCase.body),
        });
        
        expect(response.status).toBe(errorCase.expectedStatus);
        const data = await response.json();
        expect(data.error).toContain(errorCase.expectedError);
      });
    }
  });

  test('should handle concurrent requests', async () => {
    const requests = Array(5).fill(null).map(() => 
      client.readFile('./package.json')
    );
    
    const responses = await Promise.all(requests);
    
    for (const response of responses) {
      expect(response).toBeDefined();
      expect(response.tool).toBe('read_file');
      expect(response.result.success).toBe(true);
    }
  });

  test('should respond within reasonable time', async () => {
    const startTime = Date.now();
    await client.getTools();
    const endTime = Date.now();
    
    expect(endTime - startTime).toBeLessThan(1000); // Should respond within 1 second
  });
});