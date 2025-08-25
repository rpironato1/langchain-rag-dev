/**
 * MCP PLAYWRIGHT - Performance Monitor
 * Comprehensive performance monitoring and analysis
 */

import { Page } from '@playwright/test';

export interface PerformanceMetrics {
  slowRequests: number;
  failedRequests: number;
  consoleErrors: number;
  overallScore: number;
  networkMetrics: NetworkMetric[];
  performanceScore: number;
  accessibilityScore: number;
  bestPracticesScore: number;
  loadTime: number;
  timeToInteractive: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
}

export interface NetworkMetric {
  url: string;
  method: string;
  status: number;
  duration: number;
  size: number;
  type: string;
  failed: boolean;
}

export class PerformanceMonitor {
  private networkRequests: NetworkMetric[] = [];
  private consoleMessages: any[] = [];

  async monitorApplicationPerformance(page: Page): Promise<PerformanceMetrics> {
    console.log('⚡ Iniciando monitoramento de performance...');
    
    // Set up network monitoring
    await this.setupNetworkMonitoring(page);
    
    // Set up console monitoring
    await this.setupConsoleMonitoring(page);
    
    // Navigate and collect metrics
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Collect performance metrics
    const webVitals = await this.collectWebVitals(page);
    const networkMetrics = await this.analyzeNetworkRequests();
    const consoleMetrics = await this.analyzeConsoleMessages();
    
    // Calculate overall scores
    const performanceScore = await this.calculatePerformanceScore(webVitals, networkMetrics);
    const accessibilityScore = await this.estimateAccessibilityScore(page);
    const bestPracticesScore = await this.calculateBestPracticesScore(page);
    
    const overallScore = Math.round(
      (performanceScore * 0.4 + accessibilityScore * 0.3 + bestPracticesScore * 0.3)
    );
    
    const metrics: PerformanceMetrics = {
      slowRequests: networkMetrics.slowRequests,
      failedRequests: networkMetrics.failedRequests,
      consoleErrors: consoleMetrics.errors,
      overallScore,
      networkMetrics: this.networkRequests,
      performanceScore,
      accessibilityScore,
      bestPracticesScore,
      loadTime: webVitals.loadTime,
      timeToInteractive: webVitals.timeToInteractive,
      firstContentfulPaint: webVitals.firstContentfulPaint,
      largestContentfulPaint: webVitals.largestContentfulPaint,
      cumulativeLayoutShift: webVitals.cumulativeLayoutShift
    };
    
    console.log(`⚡ Performance Score: ${overallScore}/100`);
    console.log(`📡 Network: ${networkMetrics.slowRequests} slow, ${networkMetrics.failedRequests} failed`);
    console.log(`🐛 Console: ${consoleMetrics.errors} errors, ${consoleMetrics.warnings} warnings`);
    
    return metrics;
  }

  private async setupNetworkMonitoring(page: Page): Promise<void> {
    this.networkRequests = [];
    
    page.on('request', request => {
      const startTime = Date.now();
      (request as any)._startTime = startTime;
    });
    
    page.on('response', response => {
      const request = response.request();
      const startTime = (request as any)._startTime || Date.now();
      const duration = Date.now() - startTime;
      
      this.networkRequests.push({
        url: request.url(),
        method: request.method(),
        status: response.status(),
        duration,
        size: 0, // Would need response body parsing
        type: this.getResourceType(request.url()),
        failed: response.status() >= 400
      });
    });
    
    page.on('requestfailed', request => {
      this.networkRequests.push({
        url: request.url(),
        method: request.method(),
        status: 0,
        duration: 0,
        size: 0,
        type: this.getResourceType(request.url()),
        failed: true
      });
    });
  }

  private async setupConsoleMonitoring(page: Page): Promise<void> {
    this.consoleMessages = [];
    
    page.on('console', message => {
      this.consoleMessages.push({
        type: message.type(),
        text: message.text(),
        location: message.location(),
        timestamp: Date.now()
      });
    });
    
    page.on('pageerror', error => {
      this.consoleMessages.push({
        type: 'error',
        text: error.message,
        stack: error.stack,
        timestamp: Date.now()
      });
    });
  }

  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i)) return 'image';
    if (url.includes('/api/')) return 'api';
    if (url.includes('.woff') || url.includes('.ttf')) return 'font';
    return 'document';
  }

  private async collectWebVitals(page: Page): Promise<{
    loadTime: number;
    timeToInteractive: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    cumulativeLayoutShift: number;
  }> {
    const vitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        // Wait for page to be fully loaded
        if (document.readyState === 'complete') {
          collectMetrics();
        } else {
          window.addEventListener('load', collectMetrics);
        }
        
        function collectMetrics() {
          const perfEntries = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          const paintEntries = performance.getEntriesByType('paint');
          
          const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
          
          // Simulate LCP and CLS (would need real APIs in production)
          const lcp = fcp ? fcp.startTime + 500 : 1000;
          const cls = 0.1; // Simulated
          
          resolve({
            loadTime: perfEntries ? perfEntries.loadEventEnd - perfEntries.fetchStart : 0,
            timeToInteractive: perfEntries ? perfEntries.domInteractive - perfEntries.fetchStart : 0,
            firstContentfulPaint: fcp ? fcp.startTime : 0,
            largestContentfulPaint: lcp,
            cumulativeLayoutShift: cls
          });
        }
      });
    });
    
    return vitals as any;
  }

  private async analyzeNetworkRequests(): Promise<{
    slowRequests: number;
    failedRequests: number;
    totalRequests: number;
    averageResponseTime: number;
  }> {
    const slowThreshold = 3000; // 3 seconds
    
    const slowRequests = this.networkRequests.filter(req => req.duration > slowThreshold).length;
    const failedRequests = this.networkRequests.filter(req => req.failed).length;
    const totalRequests = this.networkRequests.length;
    
    const totalTime = this.networkRequests.reduce((sum, req) => sum + req.duration, 0);
    const averageResponseTime = totalRequests > 0 ? totalTime / totalRequests : 0;
    
    return {
      slowRequests,
      failedRequests,
      totalRequests,
      averageResponseTime
    };
  }

  private async analyzeConsoleMessages(): Promise<{
    errors: number;
    warnings: number;
    info: number;
    total: number;
  }> {
    const errors = this.consoleMessages.filter(msg => msg.type === 'error').length;
    const warnings = this.consoleMessages.filter(msg => msg.type === 'warning').length;
    const info = this.consoleMessages.filter(msg => msg.type === 'info').length;
    
    return {
      errors,
      warnings,
      info,
      total: this.consoleMessages.length
    };
  }

  private async calculatePerformanceScore(
    webVitals: any, 
    networkMetrics: any
  ): Promise<number> {
    let score = 100;
    
    // Penalize slow load time
    if (webVitals.loadTime > 3000) score -= 20;
    else if (webVitals.loadTime > 1500) score -= 10;
    
    // Penalize slow FCP
    if (webVitals.firstContentfulPaint > 2000) score -= 15;
    else if (webVitals.firstContentfulPaint > 1000) score -= 8;
    
    // Penalize slow LCP
    if (webVitals.largestContentfulPaint > 2500) score -= 15;
    else if (webVitals.largestContentfulPaint > 1500) score -= 8;
    
    // Penalize high CLS
    if (webVitals.cumulativeLayoutShift > 0.25) score -= 20;
    else if (webVitals.cumulativeLayoutShift > 0.1) score -= 10;
    
    // Penalize failed requests
    score -= networkMetrics.failedRequests * 5;
    
    // Penalize slow requests
    score -= networkMetrics.slowRequests * 3;
    
    return Math.max(0, Math.round(score));
  }

  private async estimateAccessibilityScore(page: Page): Promise<number> {
    const accessibilityIssues = await page.evaluate(() => {
      let issues = 0;
      
      // Check for missing alt text
      const images = document.querySelectorAll('img:not([alt])');
      issues += images.length * 5;
      
      // Check for missing form labels
      const unlabeledInputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
      const inputsWithoutLabels = Array.from(unlabeledInputs).filter(input => {
        const id = (input as HTMLInputElement).id;
        return !id || !document.querySelector(`label[for="${id}"]`);
      });
      issues += inputsWithoutLabels.length * 8;
      
      // Check for missing page language
      if (!document.documentElement.lang) issues += 10;
      
      // Check for poor contrast (simplified)
      const elements = document.querySelectorAll('*');
      let lowContrastElements = 0;
      for (let i = 0; i < Math.min(elements.length, 50); i++) {
        const el = elements[i] as HTMLElement;
        const styles = window.getComputedStyle(el);
        const color = styles.color;
        const bgColor = styles.backgroundColor;
        
        // Very basic contrast check
        if (color === 'rgb(128, 128, 128)' || color === 'lightgray') {
          lowContrastElements++;
        }
      }
      issues += Math.min(lowContrastElements * 2, 20);
      
      return issues;
    });
    
    const score = Math.max(0, 100 - accessibilityIssues);
    return Math.round(score);
  }

  private async calculateBestPracticesScore(page: Page): Promise<number> {
    const issues = await page.evaluate(() => {
      let problems = 0;
      
      // Check for HTTPS
      if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        problems += 15;
      }
      
      // Check for mixed content
      const insecureElements = document.querySelectorAll('[src^="http:"], [href^="http:"]');
      problems += Math.min(insecureElements.length * 5, 20);
      
      // Check for proper document structure
      if (!document.querySelector('title')) problems += 10;
      if (!document.querySelector('meta[name="viewport"]')) problems += 10;
      
      // Check for excessive DOM size
      const domSize = document.querySelectorAll('*').length;
      if (domSize > 3000) problems += 20;
      else if (domSize > 1500) problems += 10;
      
      // Check for inline styles and scripts
      const inlineStyles = document.querySelectorAll('[style]').length;
      const inlineScripts = document.querySelectorAll('script:not([src])').length;
      problems += Math.min((inlineStyles + inlineScripts) * 2, 15);
      
      return problems;
    });
    
    const score = Math.max(0, 100 - issues);
    return Math.round(score);
  }

  async generatePerformanceReport(metrics: PerformanceMetrics): Promise<string> {
    const reportPath = 'test-results/performance-report.json';
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        overallScore: metrics.overallScore,
        performanceScore: metrics.performanceScore,
        accessibilityScore: metrics.accessibilityScore,
        bestPracticesScore: metrics.bestPracticesScore
      },
      webVitals: {
        loadTime: metrics.loadTime,
        timeToInteractive: metrics.timeToInteractive,
        firstContentfulPaint: metrics.firstContentfulPaint,
        largestContentfulPaint: metrics.largestContentfulPaint,
        cumulativeLayoutShift: metrics.cumulativeLayoutShift
      },
      network: {
        totalRequests: metrics.networkMetrics.length,
        slowRequests: metrics.slowRequests,
        failedRequests: metrics.failedRequests,
        requestsByType: this.groupRequestsByType(metrics.networkMetrics)
      },
      console: {
        errors: metrics.consoleErrors,
        totalMessages: this.consoleMessages.length
      },
      recommendations: this.generateRecommendations(metrics)
    };
    
    const fs = require('fs');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📊 Relatório de performance gerado: ${reportPath}`);
    return reportPath;
  }

  private groupRequestsByType(requests: NetworkMetric[]): Record<string, number> {
    return requests.reduce((acc, req) => {
      acc[req.type] = (acc[req.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private generateRecommendations(metrics: PerformanceMetrics): string[] {
    const recommendations: string[] = [];
    
    if (metrics.performanceScore < 70) {
      recommendations.push('Otimizar tempo de carregamento da página');
    }
    
    if (metrics.slowRequests > 5) {
      recommendations.push('Reduzir número de requisições lentas');
    }
    
    if (metrics.failedRequests > 0) {
      recommendations.push('Corrigir requisições com falha');
    }
    
    if (metrics.consoleErrors > 3) {
      recommendations.push('Resolver erros de console JavaScript');
    }
    
    if (metrics.firstContentfulPaint > 2000) {
      recommendations.push('Melhorar First Contentful Paint');
    }
    
    if (metrics.largestContentfulPaint > 2500) {
      recommendations.push('Otimizar Largest Contentful Paint');
    }
    
    if (metrics.cumulativeLayoutShift > 0.1) {
      recommendations.push('Reduzir Cumulative Layout Shift');
    }
    
    if (metrics.accessibilityScore < 90) {
      recommendations.push('Melhorar acessibilidade da aplicação');
    }
    
    return recommendations;
  }
}