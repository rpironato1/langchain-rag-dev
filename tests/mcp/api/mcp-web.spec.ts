import { test, expect } from '@playwright/test';
import { MCPTestClient } from '../../utils/test-helpers';
import { testUrls, mockWebResults } from '../../utils/mock-data';

test.describe('MCP Web Operations', () => {
  let client: MCPTestClient;

  test.beforeEach(() => {
    client = new MCPTestClient();
  });

  test.describe('fetch_url tool', () => {
    test('should fetch JSON data successfully', async () => {
      // Use a reliable test API
      const response = await client.fetchUrl('https://httpbin.org/json');
      
      expect(response).toBeDefined(); expect(response.tool).toBe('fetch_url'); expect(response.timestamp).toBeDefined();
      expect(response.error).toBeUndefined(); expect(response.result).toBeDefined(); expect(response.result.success).toBe(true);
      
      expect(response.result.status).toBe(200);
      expect(response.result.statusText).toBe('OK');
      expect(response.result.headers).toBeDefined();
      expect(response.result.content).toBeDefined();
      
      // Should be valid JSON
      expect(() => JSON.parse(response.result.content)).not.toThrow();
    });

    test('should handle HTML content', async () => {
      const response = await client.fetchUrl('https://httpbin.org/html');
      
      expect(response).toBeDefined(); expect(response.tool).toBe('fetch_url'); expect(response.timestamp).toBeDefined();
      expect(response.error).toBeUndefined(); expect(response.result).toBeDefined(); expect(response.result.success).toBe(true);
      
      expect(response.result.status).toBe(200);
      expect(response.result.content).toContain('<html');
      expect(response.result.content).toContain('</html>');
    });

    test('should handle 404 responses gracefully', async () => {
      const response = await client.fetchUrl('https://httpbin.org/status/404');
      
      expect(response).toBeDefined(); expect(response.tool).toBe('fetch_url'); expect(response.timestamp).toBeDefined();
      expect(response.error).toBeUndefined(); expect(response.result).toBeDefined(); expect(response.result.success).toBe(true);
      
      expect(response.result.status).toBe(404);
      expect(response.result.statusText).toContain('NOT FOUND');
    });

    test('should handle different HTTP methods', async () => {
      // Test POST request
      const postResponse = await client.fetchUrl('https://httpbin.org/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ test: 'data' })
      });
      
      expectValidMCPResponse(postResponse, 'fetch_url');
      expectSuccessfulResult(postResponse);
      
      expect(postResponse.result.status).toBe(200);
      
      const responseData = JSON.parse(postResponse.result.content);
      expect(responseData.json).toEqual({ test: 'data' });
    });

    test('should include custom headers', async () => {
      const customHeaders = {
        'X-Custom-Header': 'test-value',
        'User-Agent': 'MCP-Test-Agent'
      };
      
      const response = await client.fetchUrl('https://httpbin.org/headers', {
        headers: customHeaders
      });
      
      expect(response).toBeDefined(); expect(response.tool).toBe('fetch_url'); expect(response.timestamp).toBeDefined();
      expect(response.error).toBeUndefined(); expect(response.result).toBeDefined(); expect(response.result.success).toBe(true);
      
      const responseData = JSON.parse(response.result.content);
      expect(responseData.headers['X-Custom-Header']).toBe('test-value');
      expect(responseData.headers['User-Agent']).toBe('MCP-Test-Agent');
    });

    test('should handle invalid URLs', async () => {
      const response = await client.fetchUrl('not-a-valid-url');
      
      expect(response).toBeDefined(); expect(response.tool).toBe('fetch_url'); expect(response.timestamp).toBeDefined();
      expect(response.error || response.result?.error).toBeDefined();
    });

    test('should handle network timeouts', async () => {
      // This test uses a service that intentionally delays responses
      const response = await client.fetchUrl('https://httpbin.org/delay/2');
      
      expect(response).toBeDefined(); expect(response.tool).toBe('fetch_url'); expect(response.timestamp).toBeDefined();
      // Should either succeed (if timeout is long enough) or fail with timeout error
      if (response.result && response.result.success) {
        expect(response.result.status).toBe(200);
      } else {
        expect(response.error || response.result?.error).toBeDefined();
      }
    });

    test('should preserve response headers', async () => {
      const response = await client.fetchUrl('https://httpbin.org/response-headers?Content-Type=application/json&X-Test=value');
      
      expect(response).toBeDefined(); expect(response.tool).toBe('fetch_url'); expect(response.timestamp).toBeDefined();
      expect(response.error).toBeUndefined(); expect(response.result).toBeDefined(); expect(response.result.success).toBe(true);
      
      expect(response.result.headers).toBeDefined();
      expect(typeof response.result.headers).toBe('object');
      
      // Headers should be case-insensitive accessible
      const headers = response.result.headers;
      const hasContentType = Object.keys(headers).some(key => 
        key.toLowerCase() === 'content-type'
      );
      expect(hasContentType).toBe(true);
    });

    test('should handle different content types', async () => {
      // Test different content types
      const testCases = [
        { url: 'https://httpbin.org/json', expectedType: 'application/json' },
        { url: 'https://httpbin.org/html', expectedType: 'text/html' },
        { url: 'https://httpbin.org/xml', expectedType: 'application/xml' }
      ];
      
      for (const testCase of testCases) {
        const response = await client.fetchUrl(testCase.url);
        
        expect(response).toBeDefined(); expect(response.tool).toBe('fetch_url'); expect(response.timestamp).toBeDefined();
        expect(response.error).toBeUndefined(); expect(response.result).toBeDefined(); expect(response.result.success).toBe(true);
        
        const contentType = Object.entries(response.result.headers).find(
          ([key]) => key.toLowerCase() === 'content-type'
        )?.[1];
        
        expect(contentType).toContain(testCase.expectedType);
      }
    });

    test('should handle large responses', async () => {
      // Test with a larger response
      const response = await client.fetchUrl('https://httpbin.org/base64/SFRUUEJJTiBpcyBhd2Vzb21l');
      
      expect(response).toBeDefined(); expect(response.tool).toBe('fetch_url'); expect(response.timestamp).toBeDefined();
      expect(response.error).toBeUndefined(); expect(response.result).toBeDefined(); expect(response.result.success).toBe(true);
      
      expect(response.result.content.length).toBeGreaterThan(0);
    });

    test('should handle concurrent requests', async () => {
      const urls = [
        'https://httpbin.org/json',
        'https://httpbin.org/html',
        'https://httpbin.org/xml'
      ];
      
      const requests = urls.map(url => client.fetchUrl(url));
      const responses = await Promise.all(requests);
      
      for (const response of responses) {
        expect(response).toBeDefined(); expect(response.tool).toBe('fetch_url'); expect(response.timestamp).toBeDefined();
        expect(response.error).toBeUndefined(); expect(response.result).toBeDefined(); expect(response.result.success).toBe(true);
      }
    });

    test('should handle redirects', async () => {
      const response = await client.fetchUrl('https://httpbin.org/redirect/1');
      
      expect(response).toBeDefined(); expect(response.tool).toBe('fetch_url'); expect(response.timestamp).toBeDefined();
      expect(response.error).toBeUndefined(); expect(response.result).toBeDefined(); expect(response.result.success).toBe(true);
      
      // Should follow redirect and get final response
      expect(response.result.status).toBe(200);
    });

    test('should handle different status codes', async () => {
      const statusCodes = [200, 201, 400, 401, 403, 404, 500, 502];
      
      for (const statusCode of statusCodes) {
        const response = await client.fetchUrl(`https://httpbin.org/status/${statusCode}`);
        
        expect(response).toBeDefined(); expect(response.tool).toBe('fetch_url'); expect(response.timestamp).toBeDefined();
        expect(response.error).toBeUndefined(); expect(response.result).toBeDefined(); expect(response.result.success).toBe(true);
        
        expect(response.result.status).toBe(statusCode);
      }
    });

    test('should preserve request parameters in response', async () => {
      const parameters = {
        url: 'https://httpbin.org/json',
        method: 'GET',
        headers: { 'X-Test': 'value' }
      };
      
      const response = await client.fetchUrl(parameters.url, {
        method: parameters.method,
        headers: parameters.headers
      });
      
      expect(response).toBeDefined(); expect(response.tool).toBe('fetch_url'); expect(response.timestamp).toBeDefined();
      expect(response.parameters.url).toBe(parameters.url);
      expect(response.parameters.method).toBe(parameters.method);
      expect(response.parameters.headers).toEqual(parameters.headers);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle DNS resolution failures', async () => {
      const response = await client.fetchUrl('https://this-domain-does-not-exist-12345.com');
      
      expect(response).toBeDefined(); expect(response.tool).toBe('fetch_url'); expect(response.timestamp).toBeDefined();
      expect(response.error || response.result?.error).toBeDefined();
    });

    test('should handle connection refused', async () => {
      const response = await client.fetchUrl('http://localhost:99999');
      
      expect(response).toBeDefined(); expect(response.tool).toBe('fetch_url'); expect(response.timestamp).toBeDefined();
      expect(response.error || response.result?.error).toBeDefined();
    });

    test('should handle malformed URLs', async () => {
      const malformedUrls = [
        'not-a-url',
        'ftp://invalid-protocol',
        'https://',
        'https://.',
        'javascript:alert(1)'
      ];
      
      for (const url of malformedUrls) {
        const response = await client.fetchUrl(url);
        
        expect(response).toBeDefined(); expect(response.tool).toBe('fetch_url'); expect(response.timestamp).toBeDefined();
        expect(response.error || response.result?.error).toBeDefined();
      }
    });
  });

  test.describe('Performance Tests', () => {
    test('should complete requests within reasonable time', async () => {
      const startTime = Date.now();
      const response = await client.fetchUrl('https://httpbin.org/json');
      const endTime = Date.now();
      
      expect(response).toBeDefined(); expect(response.tool).toBe('fetch_url'); expect(response.timestamp).toBeDefined();
      expect(response.error).toBeUndefined(); expect(response.result).toBeDefined(); expect(response.result.success).toBe(true);
      
      // Should complete within 10 seconds
      expect(endTime - startTime).toBeLessThan(10000);
    });

    test('should handle multiple sequential requests efficiently', async () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 3; i++) {
        const response = await client.fetchUrl('https://httpbin.org/json');
        expect(response).toBeDefined(); expect(response.tool).toBe('fetch_url'); expect(response.timestamp).toBeDefined();
        expect(response.error).toBeUndefined(); expect(response.result).toBeDefined(); expect(response.result.success).toBe(true);
      }
      
      const endTime = Date.now();
      
      // 3 requests should complete within 30 seconds
      expect(endTime - startTime).toBeLessThan(30000);
    });
  });
});