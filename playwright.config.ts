import { defineConfig, devices } from '@playwright/test';

/**
 * MCP PLAYWRIGHT - PROTOCOLO DE TESTE AUTOMATIZADO v2.0
 * Execução Autônoma por Agente IA - Cobertura 90%+ com WCAG AA
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  
  /* Autonomous execution settings */
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 3 : 2, // Increased retries for self-healing
  workers: process.env.CI ? 2 : 4, // Optimized for parallel execution
  timeout: 60000, // 60s per test for complex interactions
  
  /* Enhanced reporting for autonomous execution */
  reporter: [
    ['html', { outputFolder: 'test-results/html-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['blob', { outputDir: 'test-results/blob-report' }]
  ],
  
  /* Global test settings optimized for MCP protocol */
  use: {
    baseURL: 'http://localhost:3000',
    
    /* Enhanced tracing and debugging */
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    
    /* Accessibility and performance testing */
    contextOptions: {
      recordVideo: {
        dir: 'test-results/videos',
        size: { width: 1920, height: 1080 }
      }
    },
    
    /* WCAG compliance settings */
    actionTimeout: 10000,
    navigationTimeout: 30000,
    
    /* Enhanced interaction settings */
    launchOptions: {
      slowMo: process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 0,
    }
  },

  /* Multi-device testing matrix for autonomous execution */
  projects: [
    /* Desktop Testing */
    {
      name: 'chromium-desktop',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        headless: !process.env.HEADED,
      },
    },
    {
      name: 'firefox-desktop',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 },
        headless: !process.env.HEADED,
      },
    },
    {
      name: 'webkit-desktop',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 },
        headless: !process.env.HEADED,
      },
    },
    
    /* Tablet Testing */
    {
      name: 'tablet-landscape',
      use: { 
        ...devices['iPad Pro landscape'],
        headless: !process.env.HEADED,
      },
    },
    {
      name: 'tablet-portrait',
      use: { 
        ...devices['iPad Pro'],
        headless: !process.env.HEADED,
      },
    },
    
    /* Mobile Testing */
    {
      name: 'mobile-android',
      use: { 
        ...devices['Pixel 5'],
        headless: !process.env.HEADED,
      },
    },
    {
      name: 'mobile-ios',
      use: { 
        ...devices['iPhone 13'],
        headless: !process.env.HEADED,
      },
    },
    
    /* High Contrast & Accessibility Testing */
    {
      name: 'accessibility-testing',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        headless: !process.env.HEADED,
        contextOptions: {
          forcedColors: 'active',
          reducedMotion: 'reduce',
        }
      },
    }
  ],

  /* Enhanced web server configuration */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // 2 minutes for server startup
    stdout: 'pipe',
    stderr: 'pipe',
  },
  
  /* Global setup and teardown */
  globalSetup: require.resolve('./tests/utils/global-setup.ts'),
  globalTeardown: require.resolve('./tests/utils/global-teardown.ts'),
  
  /* Test output directory */
  outputDir: 'test-results',
  
  /* Metadata for autonomous execution */
  metadata: {
    protocolVersion: '2.0',
    coverageTarget: 0.90,
    wcagCompliance: 'AA',
    autonomousMode: true,
    selfHealing: true
  }
});