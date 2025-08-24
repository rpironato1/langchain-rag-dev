/**
 * MCP PLAYWRIGHT - Route Discovery
 * Autonomous route discovery and mapping
 */

import { Page } from '@playwright/test';
import { RouteInfo } from './autonomous-test-runner';

export class RouteDiscovery {

  async discoverApplicationRoutes(page: Page): Promise<RouteInfo[]> {
    console.log('🔍 Iniciando descoberta autônoma de rotas...');
    
    const routes: RouteInfo[] = [];
    const visitedUrls = new Set<string>();
    const baseUrl = page.url().split('/').slice(0, 3).join('/');
    
    // Start from homepage
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Get initial route info
    const homeRoute = await this.analyzeRoute(page, '/');
    routes.push(homeRoute);
    visitedUrls.add('/');
    
    // Discover routes from navigation elements
    const navRoutes = await this.extractNavigationRoutes(page);
    
    for (const route of navRoutes) {
      if (!visitedUrls.has(route) && this.isValidRoute(route)) {
        try {
          await page.goto(route);
          await page.waitForLoadState('domcontentloaded', { timeout: 10000 });
          
          const routeInfo = await this.analyzeRoute(page, route);
          routes.push(routeInfo);
          visitedUrls.add(route);
          
          console.log(`✓ Rota descoberta: ${route}`);
        } catch (error) {
          console.warn(`⚠ Erro ao acessar ${route}:`, error);
        }
      }
    }
    
    // Discover API routes
    const apiRoutes = await this.discoverAPIRoutes(page);
    routes.push(...apiRoutes);
    
    console.log(`🎯 Descoberta concluída: ${routes.length} rotas encontradas`);
    return routes;
  }

  private async analyzeRoute(page: Page, url: string): Promise<RouteInfo> {
    const title = await page.title();
    
    // Check for forms
    const formCount = await page.locator('form').count();
    const hasForms = formCount > 0;
    
    // Check for interactive elements
    const interactiveCount = await page.locator('button, input, select, textarea, [role="button"]').count();
    const hasInteractiveElements = interactiveCount > 0;
    
    return {
      url,
      title,
      hasForms,
      hasInteractiveElements
    };
  }

  private async extractNavigationRoutes(page: Page): Promise<string[]> {
    const routes = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href]'));
      const navLinks = Array.from(document.querySelectorAll('nav a[href], [role="navigation"] a[href]'));
      const buttonLinks = Array.from(document.querySelectorAll('button[onclick], [role="button"][onclick]'));
      
      const allRoutes = new Set<string>();
      
      // Extract href from links
      [...links, ...navLinks].forEach(link => {
        const href = (link as HTMLAnchorElement).href;
        if (href && href.startsWith(window.location.origin)) {
          const path = new URL(href).pathname;
          allRoutes.add(path);
        }
      });
      
      // Extract routes from data attributes
      document.querySelectorAll('[data-href], [data-route]').forEach(el => {
        const route = el.getAttribute('data-href') || el.getAttribute('data-route');
        if (route && route.startsWith('/')) {
          allRoutes.add(route);
        }
      });
      
      // Common Next.js routes patterns
      const commonRoutes = [
        '/',
        '/chat',
        '/dashboard',
        '/mcp-tools',
        '/llm-providers',
        '/terminal',
        '/reactbits',
        '/retrieval',
        '/ai_sdk',
        '/langgraph',
        '/nextjs-dev',
        '/project-planning',
        '/structured_output',
        '/retrieval_agents',
        '/agents'
      ];
      
      commonRoutes.forEach(route => allRoutes.add(route));
      
      return Array.from(allRoutes);
    });
    
    return routes.filter(route => this.isValidRoute(route));
  }

  private isValidRoute(route: string): boolean {
    // Filter out invalid routes
    const invalidPatterns = [
      /^mailto:/,
      /^tel:/,
      /^javascript:/,
      /^#/,
      /\.(pdf|jpg|jpeg|png|gif|svg|css|js|ico)$/i,
      /^\/api\/.*\.(js|ts)$/,
      /\/_next\//,
      /\/node_modules\//
    ];
    
    return !invalidPatterns.some(pattern => pattern.test(route));
  }

  private async discoverAPIRoutes(page: Page): Promise<RouteInfo[]> {
    // Discover API routes by analyzing the app structure
    const apiRoutes: RouteInfo[] = [];
    
    const commonAPIRoutes = [
      '/api/chat',
      '/api/llm-providers',
      '/api/mcp/tools',
      '/api/mcp/filesystem',
      '/api/mcp/web',
      '/api/orchestrators/project-planning',
      '/api/orchestrators/nextjs-dev'
    ];
    
    for (const route of commonAPIRoutes) {
      try {
        // Test API endpoint with OPTIONS request
        const response = await page.evaluate(async (url) => {
          const res = await fetch(url, { method: 'OPTIONS' });
          return {
            status: res.status,
            ok: res.ok,
            url
          };
        }, route);
        
        if (response.ok || response.status === 405) { // 405 = Method Not Allowed (endpoint exists)
          apiRoutes.push({
            url: route,
            title: `API: ${route}`,
            hasForms: false,
            hasInteractiveElements: false
          });
        }
      } catch (error) {
        // API route doesn't exist or is not accessible
      }
    }
    
    return apiRoutes;
  }

  async discoverDynamicRoutes(page: Page): Promise<string[]> {
    // Discover dynamic routes from client-side routing
    const dynamicRoutes = await page.evaluate(() => {
      const routes: string[] = [];
      
      // Check for Next.js router if available
      if ((window as any).__NEXT_DATA__) {
        const nextData = (window as any).__NEXT_DATA__;
        if (nextData.page) {
          routes.push(nextData.page);
        }
      }
      
      // Check for React Router routes if available
      if ((window as any).__REACT_ROUTER__) {
        // Extract routes from React Router
      }
      
      // Look for data-route attributes
      document.querySelectorAll('[data-route]').forEach(el => {
        const route = el.getAttribute('data-route');
        if (route) routes.push(route);
      });
      
      return routes;
    });
    
    return dynamicRoutes.filter(route => this.isValidRoute(route));
  }

  async analyzeRouteComplexity(page: Page, url: string): Promise<{
    complexity: 'simple' | 'medium' | 'complex';
    elements: number;
    forms: number;
    interactions: number;
    apiCalls: number;
  }> {
    await page.goto(url);
    await page.waitForLoadState('domcontentloaded');
    
    const analysis = await page.evaluate(() => {
      const elements = document.querySelectorAll('*').length;
      const forms = document.querySelectorAll('form').length;
      const interactions = document.querySelectorAll(
        'button, input, select, textarea, [onclick], [role="button"]'
      ).length;
      
      // Estimate API calls by looking for fetch/xhr patterns
      let apiCalls = 0;
      const scripts = Array.from(document.querySelectorAll('script'));
      scripts.forEach(script => {
        const content = script.textContent || '';
        apiCalls += (content.match(/fetch\(/g) || []).length;
        apiCalls += (content.match(/\.post\(/g) || []).length;
        apiCalls += (content.match(/\.get\(/g) || []).length;
      });
      
      return { elements, forms, interactions, apiCalls };
    });
    
    let complexity: 'simple' | 'medium' | 'complex' = 'simple';
    
    if (analysis.elements > 200 || analysis.interactions > 20 || analysis.apiCalls > 5) {
      complexity = 'complex';
    } else if (analysis.elements > 100 || analysis.interactions > 10 || analysis.apiCalls > 2) {
      complexity = 'medium';
    }
    
    return {
      complexity,
      ...analysis
    };
  }

  async generateSitemap(routes: RouteInfo[]): Promise<string> {
    const sitemap = routes.map(route => ({
      url: route.url,
      title: route.title,
      hasForms: route.hasForms,
      hasInteractiveElements: route.hasInteractiveElements,
      lastmod: new Date().toISOString().split('T')[0]
    }));
    
    return JSON.stringify(sitemap, null, 2);
  }
}