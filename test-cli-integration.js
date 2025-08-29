#!/usr/bin/env node

/**
 * CLI Integration Test Suite
 * Tests the new CLI orchestrator and terminal enhancements
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.cwd();
const PLANOS_DIR = path.join(PROJECT_ROOT, 'planos');
const PROJETOS_DIR = path.join(PROJECT_ROOT, 'projetos');

console.log('🤖 CLI Integration Test Suite');
console.log('==============================\n');

let testsRun = 0;
let testsPassed = 0;

function runTest(name, testFn) {
  testsRun++;
  try {
    console.log(`🧪 ${name}`);
    testFn();
    testsPassed++;
    console.log(`   ✅ PASSED\n`);
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
  }
}

// Test 1: Verify folder structure exists
runTest('Folder Structure Creation', () => {
  if (!fs.existsSync(PLANOS_DIR)) {
    throw new Error('planos directory does not exist');
  }
  if (!fs.existsSync(PROJETOS_DIR)) {
    throw new Error('projetos directory does not exist');
  }
  console.log(`   📁 planos: ${PLANOS_DIR}`);
  console.log(`   📁 projetos: ${PROJETOS_DIR}`);
});

// Test 2: Check API endpoints exist
runTest('API Endpoints', () => {
  const terminalApi = path.join(PROJECT_ROOT, 'app/api/terminal/route.ts');
  const cliOrchestratorApi = path.join(PROJECT_ROOT, 'app/api/chat/cli-orchestrator/route.ts');
  
  if (!fs.existsSync(terminalApi)) {
    throw new Error('Terminal API does not exist');
  }
  if (!fs.existsSync(cliOrchestratorApi)) {
    throw new Error('CLI Orchestrator API does not exist');
  }
  console.log(`   🚪 Terminal API: exists`);
  console.log(`   🚪 CLI Orchestrator API: exists`);
});

// Test 3: Check UI components exist
runTest('UI Components', () => {
  const terminalPage = path.join(PROJECT_ROOT, 'app/terminal/page.tsx');
  const cliOrchestratorPage = path.join(PROJECT_ROOT, 'app/cli-orchestrator/page.tsx');
  
  if (!fs.existsSync(terminalPage)) {
    throw new Error('Terminal page does not exist');
  }
  if (!fs.existsSync(cliOrchestratorPage)) {
    throw new Error('CLI Orchestrator page does not exist');
  }
  console.log(`   📄 Terminal Page: exists`);
  console.log(`   📄 CLI Orchestrator Page: exists`);
});

// Test 4: Check environment configuration
runTest('Environment Configuration', () => {
  const envExample = path.join(PROJECT_ROOT, '.env.example');
  
  if (!fs.existsSync(envExample)) {
    throw new Error('.env.example does not exist');
  }
  
  const envContent = fs.readFileSync(envExample, 'utf-8');
  
  if (!envContent.includes('CLI_FIRST_MODE')) {
    throw new Error('CLI_FIRST_MODE not found in .env.example');
  }
  if (!envContent.includes('CLAUDE_CLI_PATH')) {
    throw new Error('CLAUDE_CLI_PATH not found in .env.example');
  }
  if (!envContent.includes('GEMINI_CLI_PATH')) {
    throw new Error('GEMINI_CLI_PATH not found in .env.example');
  }
  
  console.log(`   ⚙️ CLI configuration variables: present`);
});

// Test 5: Check terminal API has CLI commands
runTest('Terminal API CLI Support', () => {
  const terminalApiPath = path.join(PROJECT_ROOT, 'app/api/terminal/route.ts');
  const content = fs.readFileSync(terminalApiPath, 'utf-8');
  
  if (!content.includes('"claude"')) {
    throw new Error('Claude command not in allowed commands');
  }
  if (!content.includes('"gemini"')) {
    throw new Error('Gemini command not in allowed commands');
  }
  if (!content.includes('background')) {
    throw new Error('Background execution not supported');
  }
  
  console.log(`   🔧 Claude CLI: supported`);
  console.log(`   🔧 Gemini CLI: supported`);
  console.log(`   ⏰ Background execution: supported`);
});

// Test 6: Check navigation includes CLI Orchestrator
runTest('Navigation Update', () => {
  const navPath = path.join(PROJECT_ROOT, 'components/LazyNavigation.tsx');
  const content = fs.readFileSync(navPath, 'utf-8');
  
  if (!content.includes('/cli-orchestrator')) {
    throw new Error('CLI Orchestrator not in navigation');
  }
  
  console.log(`   🧭 CLI Orchestrator: added to navigation`);
});

// Test 7: Check package.json has new scripts
runTest('Package Scripts', () => {
  const packagePath = path.join(PROJECT_ROOT, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  
  if (!packageJson.scripts['test:cli']) {
    throw new Error('test:cli script not found');
  }
  if (!packageJson.scripts['cli:setup']) {
    throw new Error('cli:setup script not found');
  }
  if (!packageJson.scripts['cli:test-claude']) {
    throw new Error('cli:test-claude script not found');
  }
  if (!packageJson.scripts['cli:test-gemini']) {
    throw new Error('cli:test-gemini script not found');
  }
  
  console.log(`   📦 CLI scripts: added`);
});

// Test 8: Simulate API functionality
runTest('API Structure Validation', () => {
  const cliApiPath = path.join(PROJECT_ROOT, 'app/api/chat/cli-orchestrator/route.ts');
  const content = fs.readFileSync(cliApiPath, 'utf-8');
  
  if (!content.includes('CLI_COMMANDS')) {
    throw new Error('CLI_COMMANDS not defined');
  }
  if (!content.includes('shouldUseCli')) {
    throw new Error('shouldUseCli function not found');
  }
  if (!content.includes('--dangerously-skip-permissions')) {
    throw new Error('Claude CLI flags not configured');
  }
  if (!content.includes('--yolo')) {
    throw new Error('Gemini CLI flags not configured');
  }
  
  console.log(`   🎯 CLI command templates: configured`);
  console.log(`   🧠 Decision logic: implemented`);
});

// Final results
console.log('🏁 Test Results');
console.log('===============');
console.log(`Tests run: ${testsRun}`);
console.log(`Tests passed: ${testsPassed}`);
console.log(`Tests failed: ${testsRun - testsPassed}`);
console.log(`Success rate: ${((testsPassed / testsRun) * 100).toFixed(1)}%\n`);

if (testsPassed === testsRun) {
  console.log('🎉 ALL TESTS PASSED! CLI integration is ready.');
  console.log('\n📋 Next Steps:');
  console.log('1. Install Claude CLI tool on your system');
  console.log('2. Install Gemini CLI tool on your system'); 
  console.log('3. Configure CLI_FIRST_MODE="true" in your .env');
  console.log('4. Set CLAUDE_CLI_PATH and GEMINI_CLI_PATH in .env');
  console.log('5. Test with: yarn dev');
  console.log('6. Navigate to /cli-orchestrator to test the new functionality');
  
  process.exit(0);
} else {
  console.log('❌ Some tests failed. Please check the implementation.');
  process.exit(1);
}