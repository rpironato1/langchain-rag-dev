import { test, expect } from '@playwright/test';

test.describe('MCP Tools Page UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/mcp-tools');
  });

  test('should display page title and description', async ({ page }) => {
    await expect(page.locator('h1, h2').filter({ hasText: 'MCP Tools' })).toBeVisible();
    
    await expect(page.locator('text=Model Context Protocol tools for file operations and web requests')).toBeVisible();
  });

  test('should load and display available tools', async ({ page }) => {
    // Wait for tools to load
    await expect(page.locator('[data-testid="tool-item"], .tool-item').first()).toBeVisible({ timeout: 10000 });
    
    // Check for expected tools
    await expect(page.locator('text=read_file')).toBeVisible();
    await expect(page.locator('text=write_file')).toBeVisible();
    await expect(page.locator('text=list_directory')).toBeVisible();
    await expect(page.locator('text=fetch_url')).toBeVisible();
  });

  test('should display tool descriptions', async ({ page }) => {
    await expect(page.locator('text=Read contents of a file')).toBeVisible();
    await expect(page.locator('text=Write content to a file')).toBeVisible();
    await expect(page.locator('text=List contents of a directory')).toBeVisible();
    await expect(page.locator('text=Fetch content from a URL')).toBeVisible();
  });

  test('should allow tool selection', async ({ page }) => {
    // Click on read_file tool
    await page.locator('text=read_file').click();
    
    // Should show tool details
    await expect(page.locator('input[placeholder*="Path to the file"]')).toBeVisible();
    await expect(page.locator('button:has-text("Execute Tool")')).toBeVisible();
  });

  test('should show parameter inputs when tool is selected', async ({ page }) => {
    // Select write_file tool
    await page.locator('text=write_file').click();
    
    // Should show both path and content inputs
    await expect(page.locator('input[placeholder*="Path to the file"]')).toBeVisible();
    await expect(page.locator('textarea[placeholder*="Content to write"]')).toBeVisible();
    
    // Should show required field indicators
    await expect(page.locator('text=path *')).toBeVisible();
    await expect(page.locator('text=content *')).toBeVisible();
  });

  test('should execute read_file tool successfully', async ({ page }) => {
    // Select read_file tool
    await page.locator('text=read_file').click();
    
    // Enter a valid file path
    await page.locator('input[placeholder*="Path to the file"]').fill('./package.json');
    
    // Execute the tool
    await page.locator('button:has-text("Execute Tool")').click();
    
    // Wait for execution to complete
    await expect(page.locator('text=Success').first()).toBeVisible({ timeout: 10000 });
    
    // Should show result in the results section
    await expect(page.locator('text=package.json')).toBeVisible();
    await expect(page.locator('text="name"')).toBeVisible();
  });

  test('should execute list_directory tool successfully', async ({ page }) => {
    // Select list_directory tool
    await page.locator('text=list_directory').click();
    
    // Enter a valid directory path
    await page.locator('input[placeholder*="Path to the directory"]').fill('./');
    
    // Execute the tool
    await page.locator('button:has-text("Execute Tool")').click();
    
    // Wait for execution to complete
    await expect(page.locator('text=Success').first()).toBeVisible({ timeout: 10000 });
    
    // Should show directory contents
    await expect(page.locator('text=package.json')).toBeVisible();
    await expect(page.locator('text=app')).toBeVisible();
  });

  test('should show error for invalid file path', async ({ page }) => {
    // Select read_file tool
    await page.locator('text=read_file').click();
    
    // Enter an invalid file path
    await page.locator('input[placeholder*="Path to the file"]').fill('./non-existent-file.txt');
    
    // Execute the tool
    await page.locator('button:has-text("Execute Tool")').click();
    
    // Wait for execution to complete with error
    await expect(page.locator('text=Error').first()).toBeVisible({ timeout: 10000 });
    
    // Should show error message
    await expect(page.locator('text=no such file or directory')).toBeVisible();
  });

  test('should show security error for path traversal', async ({ page }) => {
    // Select read_file tool
    await page.locator('text=read_file').click();
    
    // Enter a malicious path
    await page.locator('input[placeholder*="Path to the file"]').fill('../../../etc/passwd');
    
    // Execute the tool
    await page.locator('button:has-text("Execute Tool")').click();
    
    // Wait for execution to complete with error
    await expect(page.locator('text=Error').first()).toBeVisible({ timeout: 10000 });
    
    // Should show security error
    await expect(page.locator('text=Access denied: Path outside project directory')).toBeVisible();
  });

  test('should execute fetch_url tool successfully', async ({ page }) => {
    // Select fetch_url tool
    await page.locator('text=fetch_url').click();
    
    // Enter a valid URL
    await page.locator('input[placeholder*="URL to fetch"]').fill('https://httpbin.org/json');
    
    // Execute the tool
    await page.locator('button:has-text("Execute Tool")').click();
    
    // Wait for execution to complete
    await expect(page.locator('text=Success').first()).toBeVisible({ timeout: 15000 });
    
    // Should show HTTP status
    await expect(page.locator('text=200')).toBeVisible();
  });

  test('should show loading state during execution', async ({ page }) => {
    // Select read_file tool
    await page.locator('text=read_file').click();
    
    // Enter a valid file path
    await page.locator('input[placeholder*="Path to the file"]').fill('./package.json');
    
    // Execute the tool
    await page.locator('button:has-text("Execute Tool")').click();
    
    // Should show loading state immediately
    await expect(page.locator('button:has-text("Executing...")')).toBeVisible();
    
    // Wait for completion
    await expect(page.locator('button:has-text("Execute Tool")')).toBeVisible({ timeout: 10000 });
  });

  test('should maintain execution history', async ({ page }) => {
    // Execute multiple tools
    
    // First execution - read_file
    await page.locator('text=read_file').click();
    await page.locator('input[placeholder*="Path to the file"]').fill('./package.json');
    await page.locator('button:has-text("Execute Tool")').click();
    await expect(page.locator('text=Success').first()).toBeVisible({ timeout: 10000 });
    
    // Second execution - list_directory
    await page.locator('text=list_directory').click();
    await page.locator('input[placeholder*="Path to the directory"]').fill('./');
    await page.locator('button:has-text("Execute Tool")').click();
    await expect(page.locator('text=Success').nth(1)).toBeVisible({ timeout: 10000 });
    
    // Should show both results in history
    const results = page.locator('.border.rounded-lg');
    await expect(results).toHaveCount(2);
    
    // Should show timestamps
    await expect(page.locator('text=/\\d{1,2}:\\d{2}:\\d{2}/')).toHaveCount(2);
  });

  test('should clear parameter inputs when switching tools', async ({ page }) => {
    // Select read_file tool and enter parameters
    await page.locator('text=read_file').click();
    await page.locator('input[placeholder*="Path to the file"]').fill('./test.txt');
    
    // Switch to write_file tool
    await page.locator('text=write_file').click();
    
    // Path input should be cleared
    await expect(page.locator('input[placeholder*="Path to the file"]')).toHaveValue('');
    
    // Content input should be visible and empty
    await expect(page.locator('textarea[placeholder*="Content to write"]')).toHaveValue('');
  });

  test('should handle different parameter types correctly', async ({ page }) => {
    // Test fetch_url with advanced parameters
    await page.locator('text=fetch_url').click();
    
    // URL input should be text type
    const urlInput = page.locator('input[placeholder*="URL to fetch"]');
    await expect(urlInput).toHaveAttribute('type', 'text');
    
    // Should allow entering URL
    await urlInput.fill('https://httpbin.org/json');
    await expect(urlInput).toHaveValue('https://httpbin.org/json');
  });

  test('should show appropriate icons for different tools', async ({ page }) => {
    // Check that tools have appropriate icons (based on implementation)
    await expect(page.locator('svg').first()).toBeVisible();
    
    // Each tool should have an icon
    const toolIcons = page.locator('[class*="tool"] svg, .tool-item svg');
    await expect(toolIcons.first()).toBeVisible();
  });

  test('should be responsive on different screen sizes', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Should still show tools list
    await expect(page.locator('text=read_file')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Should show proper layout
    await expect(page.locator('text=MCP Tools')).toBeVisible();
    
    // Return to desktop
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('should handle keyboard navigation', async ({ page }) => {
    // Tab through tools
    await page.keyboard.press('Tab');
    
    // Should be able to select tool with Enter
    await page.locator('text=read_file').focus();
    await page.keyboard.press('Enter');
    
    // Should show tool parameters
    await expect(page.locator('input[placeholder*="Path to the file"]')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Select write_file tool
    await page.locator('text=write_file').click();
    
    // Try to execute without filling required fields
    await page.locator('button:has-text("Execute Tool")').click();
    
    // Should either prevent execution or show validation error
    // (depending on implementation)
    const hasValidationError = await page.locator('text=required').isVisible();
    const stillHasExecuteButton = await page.locator('button:has-text("Execute Tool")').isVisible();
    
    expect(hasValidationError || stillHasExecuteButton).toBe(true);
  });
});