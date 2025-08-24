import { test, expect } from '@playwright/test';
import { MCPTestClient, TestFileManager, TEST_DATA } from '../../utils/test-helpers';
import { testContent, performanceTestCases } from '../../utils/mock-data';

test.describe('MCP File System Operations', () => {
  let client: MCPTestClient;
  let fileManager: TestFileManager;

  test.beforeEach(async () => {
    client = new MCPTestClient();
    fileManager = new TestFileManager();
    await fileManager.ensureTestDir();
  });

  test.afterEach(async () => {
    // Cleanup any test files created during tests
    await fileManager.cleanupTestFile('test-write.txt');
    await fileManager.cleanupTestFile('test-unicode.txt');
    await fileManager.cleanupTestFile('test-large.txt');
  });

  test.describe('read_file tool', () => {
    test('should read existing file successfully', async () => {
      const response = await client.readFile('./package.json');
      
      expect(response).toBeDefined();
      expect(response.tool).toBe('read_file');
      expect(response.timestamp).toBeDefined();
      expect(new Date(response.timestamp)).toBeInstanceOf(Date);
      
      expect(response.error).toBeUndefined();
      expect(response.result).toBeDefined();
      expect(response.result.success).toBe(true);
      
      expect(response.result.content).toBeDefined();
      expect(response.result.path).toBe('./package.json');
      expect(typeof response.result.content).toBe('string');
      
      // Verify it's valid JSON
      expect(() => JSON.parse(response.result.content)).not.toThrow();
    });

    test('should read text file with special characters', async () => {
      const response = await client.readFile('./tests/fixtures/test-files/sample.txt');
      
      expect(response).toBeDefined(); expect(response.tool).toBe('read_file'); expect(response.timestamp).toBeDefined();
      expect(response.error).toBeUndefined(); expect(response.result).toBeDefined(); expect(response.result.success).toBe(true);
      
      expect(response.result.content).toContain('àáâãäåæçèéêë');
      expect(response.result.content).toContain('1234567890');
    });

    test('should read JSON file and parse correctly', async () => {
      const response = await client.readFile('./tests/fixtures/test-files/sample.json');
      
      expect(response).toBeDefined(); expect(response.tool).toBe('read_file'); expect(response.timestamp).toBeDefined();
      expect(response.error).toBeUndefined(); expect(response.result).toBeDefined(); expect(response.result.success).toBe(true);
      
      // Should be able to parse the JSON content
      const jsonContent = JSON.parse(response.result.content);
      expect(jsonContent.test).toBe(true);
      expect(jsonContent.message).toBe('Hello from MCP test fixture');
    });

    test('should handle non-existent file gracefully', async () => {
      const response = await client.readFile('./non-existent-file.txt');
      
      expect(response).toBeDefined(); expect(response.tool).toBe('read_file'); expect(response.timestamp).toBeDefined();
      expect(response.result.success).toBe(false);
      expect(response.result.error).toContain('no such file or directory');
    });

    test('should handle relative paths correctly', async () => {
      const response = await client.readFile('package.json');
      
      expect(response).toBeDefined(); expect(response.tool).toBe('read_file'); expect(response.timestamp).toBeDefined();
      expect(response.error).toBeUndefined(); expect(response.result).toBeDefined(); expect(response.result.success).toBe(true);
    });
  });

  test.describe('write_file tool', () => {
    test('should write new file successfully', async () => {
      const testContent = 'Hello, World! This is a test file.';
      const testPath = './tests/fixtures/test-files/test-write.txt';
      
      const response = await client.writeFile(testPath, testContent);
      
      expect(response).toBeDefined(); expect(response.tool).toBe('write_file'); expect(response.timestamp).toBeDefined();
      expect(response.error).toBeUndefined(); expect(response.result).toBeDefined(); expect(response.result.success).toBe(true);
      
      expect(response.result.path).toBe(testPath);
      expect(response.result.size).toBe(testContent.length);
      
      // Verify file was actually written
      const readResponse = await client.readFile(testPath);
      expect(readResponse.result.content).toBe(testContent);
    });

    test('should overwrite existing file', async () => {
      const testPath = './tests/fixtures/test-files/test-write.txt';
      const originalContent = 'Original content';
      const newContent = 'New overwritten content';
      
      // Write original file
      await client.writeFile(testPath, originalContent);
      
      // Overwrite with new content
      const response = await client.writeFile(testPath, newContent);
      
      expect(response).toBeDefined(); expect(response.tool).toBe('write_file'); expect(response.timestamp).toBeDefined();
      expect(response.error).toBeUndefined(); expect(response.result).toBeDefined(); expect(response.result.success).toBe(true);
      
      // Verify overwrite was successful
      const readResponse = await client.readFile(testPath);
      expect(readResponse.result.content).toBe(newContent);
    });

    test('should handle Unicode content correctly', async () => {
      const unicodeContent = testContent.unicodeText;
      const testPath = './tests/fixtures/test-files/test-unicode.txt';
      
      const response = await client.writeFile(testPath, unicodeContent);
      
      expect(response).toBeDefined(); expect(response.tool).toBe('write_file'); expect(response.timestamp).toBeDefined();
      expect(response.error).toBeUndefined(); expect(response.result).toBeDefined(); expect(response.result.success).toBe(true);
      
      // Verify Unicode content is preserved
      const readResponse = await client.readFile(testPath);
      expect(readResponse.result.content).toBe(unicodeContent);
    });

    test('should handle empty content', async () => {
      const testPath = './tests/fixtures/test-files/test-write.txt';
      
      const response = await client.writeFile(testPath, '');
      
      expect(response).toBeDefined(); expect(response.tool).toBe('write_file'); expect(response.timestamp).toBeDefined();
      expect(response.error).toBeUndefined(); expect(response.result).toBeDefined(); expect(response.result.success).toBe(true);
      expect(response.result.size).toBe(0);
    });

    test('should handle multiline content', async () => {
      const multilineContent = testContent.multilineText;
      const testPath = './tests/fixtures/test-files/test-write.txt';
      
      const response = await client.writeFile(testPath, multilineContent);
      
      expect(response).toBeDefined(); expect(response.tool).toBe('write_file'); expect(response.timestamp).toBeDefined();
      expect(response.error).toBeUndefined(); expect(response.result).toBeDefined(); expect(response.result.success).toBe(true);
      
      const readResponse = await client.readFile(testPath);
      expect(readResponse.result.content).toBe(multilineContent);
    });
  });

  test.describe('list_directory tool', () => {
    test('should list project root directory', async () => {
      const response = await client.listDirectory('./');
      
      expect(response).toBeDefined(); expect(response.tool).toBe('list_directory'); expect(response.timestamp).toBeDefined();
      expect(response.error).toBeUndefined(); expect(response.result).toBeDefined(); expect(response.result.success).toBe(true);
      
      expect(response.result.contents).toBeDefined();
      expect(Array.isArray(response.result.contents)).toBe(true);
      expect(response.result.path).toBe('./');
      
      // Should include common project files
      const itemNames = response.result.contents.map((item: any) => item.name);
      expect(itemNames).toContain('package.json');
      expect(itemNames).toContain('app');
      
      // Verify item structure
      for (const item of response.result.contents) {
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('type');
        expect(item).toHaveProperty('path');
        expect(['file', 'directory']).toContain(item.type);
      }
    });

    test('should list app directory contents', async () => {
      const response = await client.listDirectory('./app');
      
      expect(response).toBeDefined(); expect(response.tool).toBe('list_directory'); expect(response.timestamp).toBeDefined();
      expect(response.error).toBeUndefined(); expect(response.result).toBeDefined(); expect(response.result.success).toBe(true);
      
      const itemNames = response.result.contents.map((item: any) => item.name);
      expect(itemNames).toContain('api');
      expect(itemNames).toContain('page.tsx');
    });

    test('should list test fixtures directory', async () => {
      const response = await client.listDirectory('./tests/fixtures/test-files');
      
      expect(response).toBeDefined(); expect(response.tool).toBe('list_directory'); expect(response.timestamp).toBeDefined();
      expect(response.error).toBeUndefined(); expect(response.result).toBeDefined(); expect(response.result.success).toBe(true);
      
      const itemNames = response.result.contents.map((item: any) => item.name);
      expect(itemNames).toContain('sample.txt');
      expect(itemNames).toContain('sample.json');
    });

    test('should handle non-existent directory', async () => {
      const response = await client.listDirectory('./non-existent-directory');
      
      expect(response).toBeDefined(); expect(response.tool).toBe('list_directory'); expect(response.timestamp).toBeDefined();
      expect(response.result.success).toBe(false);
      expect(response.result.error).toContain('no such file or directory');
    });

    test('should distinguish between files and directories', async () => {
      const response = await client.listDirectory('./');
      
      expect(response).toBeDefined(); expect(response.tool).toBe('list_directory'); expect(response.timestamp).toBeDefined();
      expect(response.error).toBeUndefined(); expect(response.result).toBeDefined(); expect(response.result.success).toBe(true);
      
      const packageJson = response.result.contents.find((item: any) => item.name === 'package.json');
      const appDir = response.result.contents.find((item: any) => item.name === 'app');
      
      expect(packageJson?.type).toBe('file');
      expect(appDir?.type).toBe('directory');
    });
  });

  test.describe('Performance Tests', () => {
    for (const perfCase of performanceTestCases) {
      test(`should handle ${perfCase.name} within time limit`, async () => {
        const testPath = './tests/fixtures/test-files/test-large.txt';
        
        const startTime = Date.now();
        await client.writeFile(testPath, perfCase.content);
        const writeTime = Date.now() - startTime;
        
        const readStartTime = Date.now();
        const readResponse = await client.readFile(testPath);
        const readTime = Date.now() - readStartTime;
        
        expect(writeTime).toBeLessThan(perfCase.expectedMaxTime);
        expect(readTime).toBeLessThan(perfCase.expectedMaxTime);
        expect(readResponse.result.content).toBe(perfCase.content);
      });
    }
  });

  test('should maintain file integrity across operations', async () => {
    const testPath = './tests/fixtures/test-files/test-write.txt';
    const originalContent = JSON.stringify({
      test: true,
      numbers: [1, 2, 3, 4, 5],
      unicode: '🚀 Unicode test 中文',
      timestamp: new Date().toISOString()
    }, null, 2);
    
    // Write file
    await client.writeFile(testPath, originalContent);
    
    // Read it back
    const readResponse = await client.readFile(testPath);
    expect(readResponse.result.content).toBe(originalContent);
    
    // Verify JSON integrity
    const parsed = JSON.parse(readResponse.result.content);
    expect(parsed.test).toBe(true);
    expect(parsed.numbers).toEqual([1, 2, 3, 4, 5]);
    expect(parsed.unicode).toBe('🚀 Unicode test 中文');
  });
});