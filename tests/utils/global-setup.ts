/**
 * MCP PLAYWRIGHT - Global Setup
 * Autonomous Test Environment Initialization
 */

import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🤖 MCP PLAYWRIGHT - Iniciando ambiente autônomo...');
  
  const startTime = Date.now();
  
  try {
    // Verify server is running
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    await page.goto(config.projects[0].use.baseURL || 'http://localhost:3000', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // Verify critical pages are accessible
    const criticalRoutes = ['/', '/chat', '/mcp-tools', '/llm-providers', '/dashboard'];
    
    for (const route of criticalRoutes) {
      await page.goto(`${config.projects[0].use.baseURL}${route}`, {
        waitUntil: 'domcontentloaded',
        timeout: 15000
      });
      
      const title = await page.title();
      console.log(`✅ Route ${route} accessible - Title: ${title}`);
    }
    
    await browser.close();
    
    // Create test results directory structure
    const fs = require('fs');
    const dirs = [
      'test-results',
      'test-results/screenshots',
      'test-results/videos',
      'test-results/traces',
      'test-results/accessibility',
      'test-results/performance',
      'test-results/coverage'
    ];
    
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
    
    const setupTime = Date.now() - startTime;
    console.log(`🚀 Ambiente inicializado em ${setupTime}ms`);
    console.log('📊 Iniciando execução autônoma com cobertura 90%+');
    
  } catch (error) {
    console.error('❌ Falha na inicialização do ambiente:', error);
    throw error;
  }
}

export default globalSetup;