import { test, expect } from '@playwright/test';

test.describe('MCP Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/mcp-tools');
  });

  test('should complete full file management workflow', async ({ page }) => {
    const testContent = 'This is a test file created by Playwright integration test.';
    const testPath = './tests/fixtures/test-files/integration-test.txt';
    
    // Step 1: Write a file
    await page.locator('text=write_file').click();
    await page.locator('input[placeholder*="Path to the file"]').fill(testPath);
    await page.locator('textarea[placeholder*="Content to write"]').fill(testContent);
    await page.locator('button:has-text("Execute Tool")').click();
    
    await expect(page.locator('text=Success').first()).toBeVisible({ timeout: 10000 });
    
    // Step 2: Read the file back
    await page.locator('text=read_file').click();
    await page.locator('input[placeholder*="Path to the file"]').fill(testPath);
    await page.locator('button:has-text("Execute Tool")').click();
    
    await expect(page.locator('text=Success').nth(1)).toBeVisible({ timeout: 10000 });
    await expect(page.locator(`text=${testContent}`)).toBeVisible();
    
    // Step 3: List the directory to verify file exists
    await page.locator('text=list_directory').click();
    await page.locator('input[placeholder*="Path to the directory"]').fill('./tests/fixtures/test-files');
    await page.locator('button:has-text("Execute Tool")').click();
    
    await expect(page.locator('text=Success').nth(2)).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=integration-test.txt')).toBeVisible();
  });

  test('should handle file operations with special characters', async ({ page }) => {
    const specialContent = 'Special characters: àáâãäåæçèéêë 中文 العربية 🚀\nMultiple lines\nWith\tTabs';
    const testPath = './tests/fixtures/test-files/special-chars-test.txt';
    
    // Write file with special characters
    await page.locator('text=write_file').click();
    await page.locator('input[placeholder*="Path to the file"]').fill(testPath);
    await page.locator('textarea[placeholder*="Content to write"]').fill(specialContent);
    await page.locator('button:has-text("Execute Tool")').click();
    
    await expect(page.locator('text=Success').first()).toBeVisible({ timeout: 10000 });
    
    // Read back and verify special characters are preserved
    await page.locator('text=read_file').click();
    await page.locator('input[placeholder*="Path to the file"]').fill(testPath);
    await page.locator('button:has-text("Execute Tool")').click();
    
    await expect(page.locator('text=Success').nth(1)).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=àáâãäåæçèéêë')).toBeVisible();
    await expect(page.locator('text=中文')).toBeVisible();
    await expect(page.locator('text=🚀')).toBeVisible();
  });

  test('should demonstrate web API integration workflow', async ({ page }) => {
    // Fetch JSON data
    await page.locator('text=fetch_url').click();
    await page.locator('input[placeholder*="URL to fetch"]').fill('https://httpbin.org/json');
    await page.locator('button:has-text("Execute Tool")').click();
    
    await expect(page.locator('text=Success').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=200')).toBeVisible();
    
    // Fetch different content type
    await page.locator('input[placeholder*="URL to fetch"]').clear();
    await page.locator('input[placeholder*="URL to fetch"]').fill('https://httpbin.org/html');
    await page.locator('button:has-text("Execute Tool")').click();
    
    await expect(page.locator('text=Success').nth(1)).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=<html')).toBeVisible();
  });

  test('should show comprehensive error handling across operations', async ({ page }) => {
    // Test file not found
    await page.locator('text=read_file').click();
    await page.locator('input[placeholder*="Path to the file"]').fill('./non-existent-file.txt');
    await page.locator('button:has-text("Execute Tool")').click();
    
    await expect(page.locator('text=Error').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=no such file or directory')).toBeVisible();
    
    // Test security violation
    await page.locator('input[placeholder*="Path to the file"]').clear();
    await page.locator('input[placeholder*="Path to the file"]').fill('../../../etc/passwd');
    await page.locator('button:has-text("Execute Tool")').click();
    
    await expect(page.locator('text=Error').nth(1)).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Access denied')).toBeVisible();
    
    // Test invalid URL
    await page.locator('text=fetch_url').click();
    await page.locator('input[placeholder*="URL to fetch"]').fill('not-a-valid-url');
    await page.locator('button:has-text("Execute Tool")').click();
    
    await expect(page.locator('text=Error').nth(2)).toBeVisible({ timeout: 10000 });
  });

  test('should maintain state during complex multi-tool workflow', async ({ page }) => {
    // Create a JSON file
    const jsonData = {
      name: 'Integration Test',
      timestamp: new Date().toISOString(),
      data: [1, 2, 3, 4, 5]
    };
    const jsonPath = './tests/fixtures/test-files/workflow-test.json';
    
    // Write JSON file
    await page.locator('text=write_file').click();
    await page.locator('input[placeholder*="Path to the file"]').fill(jsonPath);
    await page.locator('textarea[placeholder*="Content to write"]').fill(JSON.stringify(jsonData, null, 2));
    await page.locator('button:has-text("Execute Tool")').click();
    
    await expect(page.locator('text=Success').first()).toBeVisible({ timeout: 10000 });
    
    // Read it back to verify
    await page.locator('text=read_file').click();
    await page.locator('input[placeholder*="Path to the file"]').fill(jsonPath);
    await page.locator('button:has-text("Execute Tool")').click();
    
    await expect(page.locator('text=Success').nth(1)).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Integration Test')).toBeVisible();
    
    // Overwrite with new content
    const updatedData = { ...jsonData, updated: true };
    await page.locator('text=write_file').click();
    await page.locator('input[placeholder*="Path to the file"]').fill(jsonPath);
    await page.locator('textarea[placeholder*="Content to write"]').clear();
    await page.locator('textarea[placeholder*="Content to write"]').fill(JSON.stringify(updatedData, null, 2));
    await page.locator('button:has-text("Execute Tool")').click();
    
    await expect(page.locator('text=Success').nth(2)).toBeVisible({ timeout: 10000 });
    
    // Verify update
    await page.locator('text=read_file').click();
    await page.locator('input[placeholder*="Path to the file"]').fill(jsonPath);
    await page.locator('button:has-text("Execute Tool")').click();
    
    await expect(page.locator('text=Success').nth(3)).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text="updated": true')).toBeVisible();
    
    // List directory to confirm file is there
    await page.locator('text=list_directory').click();
    await page.locator('input[placeholder*="Path to the directory"]').fill('./tests/fixtures/test-files');
    await page.locator('button:has-text("Execute Tool")').click();
    
    await expect(page.locator('text=Success').nth(4)).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=workflow-test.json')).toBeVisible();
    
    // Should have 5 results in history
    const results = page.locator('.border.rounded-lg p-3');
    await expect(results).toHaveCount(5);
  });

  test('should handle concurrent operations correctly', async ({ page }) => {
    // Open multiple tabs or perform multiple operations rapidly
    // This tests the UI's ability to handle multiple requests
    
    // Select read_file tool
    await page.locator('text=read_file').click();
    
    // Rapidly execute multiple read operations
    const files = ['./package.json', './tsconfig.json', './next.config.js'];
    
    for (const file of files) {
      await page.locator('input[placeholder*="Path to the file"]').clear();
      await page.locator('input[placeholder*="Path to the file"]').fill(file);
      await page.locator('button:has-text("Execute Tool")').click();
      
      // Wait a brief moment before next execution
      await page.waitForTimeout(500);
    }
    
    // Should eventually show all results
    await expect(page.locator('text=Success').nth(2)).toBeVisible({ timeout: 15000 });
    
    // Should show results for all files
    await expect(page.locator('text=package.json')).toBeVisible();
    await expect(page.locator('text=next.config.js')).toBeVisible();
  });

  test('should provide accessible user experience', async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    
    // Should be able to navigate through tools
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Test with screen reader considerations
    await expect(page.locator('[aria-label], [role]').first()).toBeVisible();
    
    // Tool selection should update focus appropriately
    await page.locator('text=read_file').click();
    await expect(page.locator('input[placeholder*="Path to the file"]')).toBeFocused();
  });

  test('should maintain performance with large result sets', async ({ page }) => {
    // List a directory with many files
    await page.locator('text=list_directory').click();
    await page.locator('input[placeholder*="Path to the directory"]').fill('./node_modules');
    
    const startTime = Date.now();
    await page.locator('button:has-text("Execute Tool")').click();
    
    // Should complete within reasonable time even for large directories
    await expect(page.locator('text=Success, text=Error').first()).toBeVisible({ timeout: 30000 });
    
    const endTime = Date.now();
    expect(endTime - startTime).toBeLessThan(30000);
    
    // UI should remain responsive
    await expect(page.locator('button:has-text("Execute Tool")')).toBeEnabled();
  });

  test('should handle edge cases gracefully', async ({ page }) => {
    // Empty path
    await page.locator('text=read_file').click();
    await page.locator('input[placeholder*="Path to the file"]').fill('');
    await page.locator('button:has-text("Execute Tool")').click();
    
    // Should handle gracefully
    await expect(page.locator('text=Success, text=Error').first()).toBeVisible({ timeout: 10000 });
    
    // Very long path
    const longPath = './tests/fixtures/test-files/' + 'a'.repeat(100) + '.txt';
    await page.locator('input[placeholder*="Path to the file"]').clear();
    await page.locator('input[placeholder*="Path to the file"]').fill(longPath);
    await page.locator('button:has-text("Execute Tool")').click();
    
    await expect(page.locator('text=Success, text=Error').nth(1)).toBeVisible({ timeout: 10000 });
    
    // Special characters in path
    await page.locator('input[placeholder*="Path to the file"]').clear();
    await page.locator('input[placeholder*="Path to the file"]').fill('./test with spaces & symbols!.txt');
    await page.locator('button:has-text("Execute Tool")').click();
    
    await expect(page.locator('text=Success, text=Error').nth(2)).toBeVisible({ timeout: 10000 });
  });

  test('should provide clear feedback for all operations', async ({ page }) => {
    // Test different success/error states have appropriate visual feedback
    
    // Successful operation
    await page.locator('text=read_file').click();
    await page.locator('input[placeholder*="Path to the file"]').fill('./package.json');
    await page.locator('button:has-text("Execute Tool")').click();
    
    await expect(page.locator('text=Success')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.bg-muted, .border-primary, .text-green').first()).toBeVisible();
    
    // Error operation
    await page.locator('input[placeholder*="Path to the file"]').clear();
    await page.locator('input[placeholder*="Path to the file"]').fill('./non-existent.txt');
    await page.locator('button:has-text("Execute Tool")').click();
    
    await expect(page.locator('text=Error')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.text-destructive, .bg-destructive, .border-destructive').first()).toBeVisible();
    
    // Should show timestamps for both
    await expect(page.locator('text=/\\d{1,2}:\\d{2}:\\d{2}/')).toHaveCount(2);
  });
});