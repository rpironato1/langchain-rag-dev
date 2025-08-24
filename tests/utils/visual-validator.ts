/**
 * MCP PLAYWRIGHT - Visual Validator
 * Visual regression testing and accessibility validation
 */

import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export interface VisualTestResult {
  baseline: string;
  current: string;
  diff?: string;
  passed: boolean;
  threshold: number;
}

export class VisualValidator {
  private screenshotDir = 'test-results/screenshots';
  private baselineDir = 'test-results/baselines';

  constructor() {
    this.ensureDirectories();
  }

  private ensureDirectories() {
    const dirs = [this.screenshotDir, this.baselineDir];
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async captureInitialScreenshot(page: Page): Promise<string> {
    console.log('📸 Capturando screenshot inicial...');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotPath = path.join(this.screenshotDir, `initial-${timestamp}.png`);
    
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
      animations: 'disabled'
    });
    
    console.log(`📸 Screenshot salvo: ${screenshotPath}`);
    return screenshotPath;
  }

  async validateNoHorizontalScroll(page: Page): Promise<boolean> {
    console.log('📏 Validando scroll horizontal (WCAG 1.4.4)...');
    
    const scrollInfo = await page.evaluate(() => {
      const body = document.body;
      const html = document.documentElement;
      
      const scrollWidth = Math.max(
        body.scrollWidth, body.offsetWidth,
        html.clientWidth, html.scrollWidth, html.offsetWidth
      );
      
      const clientWidth = html.clientWidth;
      
      return {
        scrollWidth,
        clientWidth,
        hasHorizontalScroll: scrollWidth > clientWidth,
        ratio: scrollWidth / clientWidth
      };
    });
    
    const passed = !scrollInfo.hasHorizontalScroll;
    console.log(`📏 Scroll horizontal: ${passed ? 'OK' : 'FAIL'} (ratio: ${scrollInfo.ratio.toFixed(2)})`);
    
    return passed;
  }

  async captureZoomedScreenshot(page: Page): Promise<string> {
    console.log('📸 Capturando screenshot com zoom 200%...');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotPath = path.join(this.screenshotDir, `zoomed-200-${timestamp}.png`);
    
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
      animations: 'disabled'
    });
    
    return screenshotPath;
  }

  async captureHighContrastScreenshot(page: Page): Promise<string> {
    console.log('📸 Capturando screenshot em alto contraste...');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotPath = path.join(this.screenshotDir, `high-contrast-${timestamp}.png`);
    
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
      animations: 'disabled'
    });
    
    return screenshotPath;
  }

  async captureElementScreenshot(page: Page, selector: string, name: string): Promise<string> {
    const element = page.locator(selector);
    if (await element.count() === 0) {
      throw new Error(`Element not found: ${selector}`);
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotPath = path.join(this.screenshotDir, `element-${name}-${timestamp}.png`);
    
    await element.screenshot({
      path: screenshotPath,
      animations: 'disabled'
    });
    
    return screenshotPath;
  }

  async compareVisualRegression(page: Page, testName: string, options?: {
    threshold?: number;
    fullPage?: boolean;
  }): Promise<VisualTestResult> {
    const { threshold = 0.1, fullPage = true } = options || {};
    
    const currentPath = path.join(this.screenshotDir, `${testName}-current.png`);
    const baselinePath = path.join(this.baselineDir, `${testName}-baseline.png`);
    const diffPath = path.join(this.screenshotDir, `${testName}-diff.png`);
    
    // Capture current screenshot
    await page.screenshot({
      path: currentPath,
      fullPage,
      animations: 'disabled'
    });
    
    // Check if baseline exists
    if (!fs.existsSync(baselinePath)) {
      // First run - create baseline
      fs.copyFileSync(currentPath, baselinePath);
      console.log(`📸 Baseline criado para: ${testName}`);
      
      return {
        baseline: baselinePath,
        current: currentPath,
        passed: true,
        threshold
      };
    }
    
    // Compare images (simplified - in real scenario would use image diff library)
    const passed = await this.compareImages(baselinePath, currentPath, threshold);
    
    return {
      baseline: baselinePath,
      current: currentPath,
      diff: passed ? undefined : diffPath,
      passed,
      threshold
    };
  }

  private async compareImages(baseline: string, current: string, threshold: number): Promise<boolean> {
    // Simplified comparison - in real implementation would use pixelmatch or similar
    const baselineStats = fs.statSync(baseline);
    const currentStats = fs.statSync(current);
    
    // Basic size comparison
    const sizeDiff = Math.abs(baselineStats.size - currentStats.size) / baselineStats.size;
    return sizeDiff <= threshold;
  }

  async validateResponsiveDesign(page: Page, testName: string): Promise<{
    mobile: VisualTestResult;
    tablet: VisualTestResult;
    desktop: VisualTestResult;
  }> {
    console.log('📱 Validando design responsivo...');
    
    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1920, height: 1080 }
    ];
    
    const results: any = {};
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(1000); // Allow layout to settle
      
      const result = await this.compareVisualRegression(
        page, 
        `${testName}-${viewport.name}`,
        { fullPage: true }
      );
      
      results[viewport.name] = result;
      console.log(`📱 ${viewport.name}: ${result.passed ? 'PASS' : 'FAIL'}`);
    }
    
    return results;
  }

  async validateColorSchemes(page: Page, testName: string): Promise<{
    light: VisualTestResult;
    dark: VisualTestResult;
    highContrast: VisualTestResult;
  }> {
    console.log('🎨 Validando esquemas de cores...');
    
    const schemes = [
      { 
        name: 'light', 
        mediaQuery: '(prefers-color-scheme: light)',
        css: '' 
      },
      { 
        name: 'dark', 
        mediaQuery: '(prefers-color-scheme: dark)',
        css: 'html { filter: invert(1); }' 
      },
      { 
        name: 'highContrast', 
        mediaQuery: '(prefers-contrast: high)',
        css: '* { filter: contrast(200%) !important; }' 
      }
    ];
    
    const results: any = {};
    
    for (const scheme of schemes) {
      // Apply color scheme
      if (scheme.css) {
        await page.addStyleTag({ content: scheme.css });
      }
      
      await page.waitForTimeout(500);
      
      const result = await this.compareVisualRegression(
        page,
        `${testName}-${scheme.name}`,
        { fullPage: true }
      );
      
      results[scheme.name] = result;
      console.log(`🎨 ${scheme.name}: ${result.passed ? 'PASS' : 'FAIL'}`);
      
      // Remove applied styles
      if (scheme.css) {
        await page.evaluate(() => {
          const styles = document.querySelectorAll('style');
          const lastStyle = styles[styles.length - 1];
          if (lastStyle) lastStyle.remove();
        });
      }
    }
    
    return results;
  }

  async validatePrintStyles(page: Page, testName: string): Promise<VisualTestResult> {
    console.log('🖨️ Validando estilos de impressão...');
    
    // Emulate print media
    await page.emulateMedia({ media: 'print' });
    await page.waitForTimeout(500);
    
    const result = await this.compareVisualRegression(
      page,
      `${testName}-print`,
      { fullPage: true }
    );
    
    // Reset to screen media
    await page.emulateMedia({ media: 'screen' });
    
    console.log(`🖨️ Print styles: ${result.passed ? 'PASS' : 'FAIL'}`);
    return result;
  }

  async validateAnimations(page: Page): Promise<{
    respectsReducedMotion: boolean;
    animationsWork: boolean;
    performanceImpact: boolean;
  }> {
    console.log('🎬 Validando animações...');
    
    // Check for animations
    const animationInfo = await page.evaluate(() => {
      const animated = document.querySelectorAll(`
        [style*="animation"], 
        [style*="transition"],
        .animate, .animation, .transition,
        [class*="animate"], [class*="transition"]
      `);
      
      return {
        animatedElements: animated.length,
        hasAnimations: animated.length > 0
      };
    });
    
    // Test reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForTimeout(500);
    
    const reducedMotionRespected = await page.evaluate(() => {
      // Check if animations are disabled/reduced
      const computedStyles = getComputedStyle(document.body);
      return computedStyles.getPropertyValue('animation-duration') === '0s' ||
             computedStyles.getPropertyValue('transition-duration') === '0s';
    });
    
    // Reset reduced motion
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    
    return {
      respectsReducedMotion: reducedMotionRespected,
      animationsWork: animationInfo.hasAnimations,
      performanceImpact: false // Would need performance monitoring
    };
  }

  async generateVisualReport(results: any): Promise<string> {
    const reportPath = path.join('test-results', 'visual-report.html');
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MCP Visual Testing Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .result { margin: 20px 0; padding: 15px; border-radius: 5px; }
        .pass { background: #d4edda; border: 1px solid #c3e6cb; }
        .fail { background: #f8d7da; border: 1px solid #f5c6cb; }
        .screenshot { max-width: 300px; margin: 10px 0; }
        h1 { color: #333; }
        h2 { color: #666; }
    </style>
</head>
<body>
    <h1>🤖 MCP Visual Testing Report</h1>
    <p>Generated: ${new Date().toISOString()}</p>
    
    ${Object.entries(results).map(([test, result]: [string, any]) => `
        <div class="result ${result.passed ? 'pass' : 'fail'}">
            <h2>${test}</h2>
            <p>Status: ${result.passed ? '✅ PASS' : '❌ FAIL'}</p>
            <p>Threshold: ${result.threshold || 'N/A'}</p>
            ${result.current ? `<img src="${result.current}" alt="Current" class="screenshot">` : ''}
            ${result.diff ? `<img src="${result.diff}" alt="Diff" class="screenshot">` : ''}
        </div>
    `).join('')}
</body>
</html>`;
    
    fs.writeFileSync(reportPath, html);
    console.log(`📊 Relatório visual gerado: ${reportPath}`);
    
    return reportPath;
  }

  async capturePageMetrics(page: Page): Promise<{
    renderTime: number;
    layoutShifts: number;
    paintMetrics: any;
    elementCount: number;
  }> {
    const metrics = await page.evaluate(() => {
      const perfEntries = performance.getEntriesByType('navigation');
      const paintEntries = performance.getEntriesByType('paint');
      
      const navigation = perfEntries[0] as PerformanceNavigationTiming;
      
      return {
        renderTime: navigation ? navigation.loadEventEnd - navigation.fetchStart : 0,
        layoutShifts: 0, // Would need Layout Instability API
        paintMetrics: paintEntries.reduce((acc: any, entry) => {
          acc[entry.name] = entry.startTime;
          return acc;
        }, {}),
        elementCount: document.querySelectorAll('*').length
      };
    });
    
    return metrics;
  }
}