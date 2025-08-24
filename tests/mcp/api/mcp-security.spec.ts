import { test, expect } from '@playwright/test';
import { MCPTestClient } from '../../utils/test-helpers';
import { securityTestCases } from '../../utils/mock-data';

test.describe('MCP Security Boundaries', () => {
  let client: MCPTestClient;

  test.beforeEach(() => {
    client = new MCPTestClient();
  });

  test.describe('Path Traversal Protection', () => {
    for (const testCase of securityTestCases) {
      test(`should ${testCase.shouldFail ? 'block' : 'allow'} ${testCase.name}`, async () => {
        const response = await client.readFile(testCase.path);
        
        expect(response).toBeDefined(); expect(response.tool).toBe('read_file'); expect(response.timestamp).toBeDefined();
        
        if (testCase.shouldFail) {
          expect(response.error || response.result?.error).toBeDefined(); expect(response.error || response.result?.error).toContain(testCase.expectedError);
        } else {
          // For valid paths, we expect either success or a file not found error
          // but NOT a security error
          if (response.result && !response.result.success) {
            expect(response.result.error).not.toContain('Access denied');
            expect(response.result.error).not.toContain('Path outside project directory');
          }
        }
      });
    }
  });

  test.describe('File System Security', () => {
    test('should prevent reading sensitive system files', async () => {
      const sensitiveFiles = [
        '/etc/passwd',
        '/etc/shadow',
        '/etc/hosts',
        '../../etc/passwd',
        '../../../etc/passwd',
        '../../../../etc/passwd'
      ];
      
      for (const filePath of sensitiveFiles) {
        const response = await client.readFile(filePath);
        
        expect(response).toBeDefined(); expect(response.tool).toBe('read_file'); expect(response.timestamp).toBeDefined();
        expectErrorResult(response, 'Access denied: Path outside project directory');
      }
    });

    test('should prevent writing to sensitive system directories', async () => {
      const sensitivePaths = [
        '/etc/test.txt',
        '/usr/bin/test',
        '/var/log/test.log',
        '../../etc/test.txt',
        '../../../tmp/test.txt'
      ];
      
      for (const filePath of sensitivePaths) {
        const response = await client.writeFile(filePath, 'test content');
        
        expectValidMCPResponse(response, 'write_file');
        expectErrorResult(response, 'Access denied: Path outside project directory');
      }
    });

    test('should prevent listing sensitive system directories', async () => {
      const sensitiveDirs = [
        '/etc',
        '/usr/bin',
        '/var',
        '../../etc',
        '../../../usr'
      ];
      
      for (const dirPath of sensitiveDirs) {
        const response = await client.listDirectory(dirPath);
        
        expectValidMCPResponse(response, 'list_directory');
        expectErrorResult(response, 'Access denied: Path outside project directory');
      }
    });

    test('should allow access to project subdirectories', async () => {
      const validPaths = [
        './app',
        './components',
        './tests',
        'app/api',
        'app/api/mcp'
      ];
      
      for (const dirPath of validPaths) {
        const response = await client.listDirectory(dirPath);
        
        expectValidMCPResponse(response, 'list_directory');
        
        // Should either succeed or fail with "not found", but not security error
        if (response.result && !response.result.success) {
          expect(response.result.error).not.toContain('Access denied');
          expect(response.result.error).not.toContain('Path outside project directory');
        }
      }
    });
  });

  test.describe('URL Encoded Path Traversal Protection', () => {
    test('should block URL-encoded path traversal attempts', async () => {
      const encodedPaths = [
        '%2E%2E%2F%2E%2E%2Fetc%2Fpasswd',
        '%2E%2E%5C%2E%2E%5Cetc%5Cpasswd',
        '..%2F..%2Fetc%2Fpasswd',
        '..%5C..%5Cetc%5Cpasswd'
      ];
      
      for (const encodedPath of encodedPaths) {
        const response = await client.readFile(encodedPath);
        
        expect(response).toBeDefined(); expect(response.tool).toBe('read_file'); expect(response.timestamp).toBeDefined();
        expectErrorResult(response, 'Access denied: Path outside project directory');
      }
    });
  });

  test.describe('Symlink Protection', () => {
    test('should handle symlinks safely', async () => {
      // Try to read a common symlink location
      const response = await client.readFile('/proc/self/environ');
      
      expect(response).toBeDefined(); expect(response.tool).toBe('read_file'); expect(response.timestamp).toBeDefined();
      expectErrorResult(response, 'Access denied: Path outside project directory');
    });
  });

  test.describe('Windows Path Traversal Protection', () => {
    test('should block Windows-style path traversal', async () => {
      const windowsPaths = [
        '..\\..\\..\\Windows\\System32\\config\\SAM',
        '..\\..\\..\\etc\\passwd',
        'C:\\Windows\\System32\\config\\SAM',
        'C:\\etc\\passwd'
      ];
      
      for (const windowsPath of windowsPaths) {
        const response = await client.readFile(windowsPath);
        
        expect(response).toBeDefined(); expect(response.tool).toBe('read_file'); expect(response.timestamp).toBeDefined();
        expectErrorResult(response, 'Access denied: Path outside project directory');
      }
    });
  });

  test.describe('Null Byte Injection Protection', () => {
    test('should handle null byte injection attempts', async () => {
      const nullBytePaths = [
        './package.json\x00.txt',
        './package.json%00.txt',
        '../../../etc/passwd\x00.txt'
      ];
      
      for (const nullBytePath of nullBytePaths) {
        const response = await client.readFile(nullBytePath);
        
        expect(response).toBeDefined(); expect(response.tool).toBe('read_file'); expect(response.timestamp).toBeDefined();
        
        // Should either block with security error or handle as invalid path
        if (response.result && !response.result.success) {
          // We accept either security error or file not found for null byte attempts
          const isSecurityError = response.result.error?.includes('Access denied');
          const isNotFoundError = response.result.error?.includes('no such file');
          expect(isSecurityError || isNotFoundError).toBe(true);
        }
      }
    });
  });

  test.describe('Special File Protection', () => {
    test('should prevent access to device files', async () => {
      const deviceFiles = [
        '/dev/null',
        '/dev/zero',
        '/dev/random',
        '../../dev/null'
      ];
      
      for (const deviceFile of deviceFiles) {
        const response = await client.readFile(deviceFile);
        
        expect(response).toBeDefined(); expect(response.tool).toBe('read_file'); expect(response.timestamp).toBeDefined();
        expectErrorResult(response, 'Access denied: Path outside project directory');
      }
    });

    test('should prevent access to proc filesystem', async () => {
      const procFiles = [
        '/proc/version',
        '/proc/meminfo',
        '/proc/cpuinfo',
        '../../proc/version'
      ];
      
      for (const procFile of procFiles) {
        const response = await client.readFile(procFile);
        
        expect(response).toBeDefined(); expect(response.tool).toBe('read_file'); expect(response.timestamp).toBeDefined();
        expectErrorResult(response, 'Access denied: Path outside project directory');
      }
    });
  });

  test.describe('Large Path Protection', () => {
    test('should handle extremely long paths', async () => {
      const longPath = '../'.repeat(1000) + 'etc/passwd';
      
      const response = await client.readFile(longPath);
      
      expect(response).toBeDefined(); expect(response.tool).toBe('read_file'); expect(response.timestamp).toBeDefined();
      expectErrorResult(response, 'Access denied: Path outside project directory');
    });

    test('should handle deeply nested paths', async () => {
      const deepPath = 'a/'.repeat(100) + 'test.txt';
      
      const response = await client.readFile(deepPath);
      
      expect(response).toBeDefined(); expect(response.tool).toBe('read_file'); expect(response.timestamp).toBeDefined();
      
      // Should fail with file not found, not security error
      if (response.result && !response.result.success) {
        expect(response.result.error).not.toContain('Access denied');
      }
    });
  });

  test.describe('Concurrent Security Tests', () => {
    test('should maintain security under concurrent access attempts', async () => {
      const maliciousPaths = [
        '../../../etc/passwd',
        '../../etc/shadow',
        '/etc/hosts',
        '../../../var/log/auth.log'
      ];
      
      const requests = maliciousPaths.map(path => client.readFile(path));
      const responses = await Promise.all(requests);
      
      for (const response of responses) {
        expect(response).toBeDefined(); expect(response.tool).toBe('read_file'); expect(response.timestamp).toBeDefined();
        expectErrorResult(response, 'Access denied: Path outside project directory');
      }
    });
  });

  test.describe('Edge Cases', () => {
    test('should handle empty path', async () => {
      const response = await client.readFile('');
      
      expect(response).toBeDefined(); expect(response.tool).toBe('read_file'); expect(response.timestamp).toBeDefined();
      
      // Should fail with appropriate error, not crash
      expect(response.result || response.error).toBeDefined();
    });

    test('should handle path with only dots', async () => {
      const dotPaths = ['.', '..', '...', '....'];
      
      for (const dotPath of dotPaths) {
        const response = await client.readFile(dotPath);
        
        expect(response).toBeDefined(); expect(response.tool).toBe('read_file'); expect(response.timestamp).toBeDefined();
        
        // '.' should work (current directory), others might fail
        if (dotPath !== '.') {
          if (response.result && !response.result.success) {
            // Should not be a security error for these cases
            expect(response.result.error).not.toContain('Access denied');
          }
        }
      }
    });

    test('should handle path with special characters', async () => {
      const specialChars = ['?', '*', '<', '>', '|', '"', ':'];
      
      for (const char of specialChars) {
        const response = await client.readFile(`test${char}file.txt`);
        
        expect(response).toBeDefined(); expect(response.tool).toBe('read_file'); expect(response.timestamp).toBeDefined();
        
        // Should handle gracefully, not crash
        if (response.result && !response.result.success) {
          expect(response.result.error).not.toContain('Access denied');
        }
      }
    });
  });
});