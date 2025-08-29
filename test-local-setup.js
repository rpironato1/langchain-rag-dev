/**
 * Local Development Test - Basic Functionality
 * Tests basic functionality without requiring Playwright browsers
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Local Development Test - Basic Functionality');
console.log('================================================');

let passed = 0;
let failed = 0;

function test(name, condition) {
  if (condition) {
    console.log(`✅ ${name}`);
    passed++;
  } else {
    console.log(`❌ ${name}`);
    failed++;
  }
}

function testAsync(name, promise) {
  return promise
    .then(() => {
      console.log(`✅ ${name}`);
      passed++;
    })
    .catch((error) => {
      console.log(`❌ ${name}: ${error.message}`);
      failed++;
    });
}

async function runTests() {
  console.log('\n📋 File Structure Tests');
  console.log('========================');
  
  // Test essential files exist
  test('package.json exists', fs.existsSync('package.json'));
  test('tsconfig.json exists', fs.existsSync('tsconfig.json'));
  test('next.config.js exists', fs.existsSync('next.config.js'));
  test('playwright.config.ts exists', fs.existsSync('playwright.config.ts'));
  test('.env.local exists', fs.existsSync('.env.local'));
  test('LOCAL_SETUP.md exists', fs.existsSync('LOCAL_SETUP.md'));
  
  // Test directory structure
  test('app directory exists', fs.existsSync('app'));
  test('components directory exists', fs.existsSync('components'));
  test('lib directory exists', fs.existsSync('lib'));
  test('tests directory exists', fs.existsSync('tests'));
  test('node_modules exists', fs.existsSync('node_modules'));
  
  console.log('\n🔧 Configuration Tests');
  console.log('=======================');
  
  // Test package.json scripts
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  test('dev script exists', packageJson.scripts && packageJson.scripts.dev);
  test('build script exists', packageJson.scripts && packageJson.scripts.build);
  test('test:autonomous script exists', packageJson.scripts && packageJson.scripts['test:autonomous']);
  test('validate:autonomous script exists', packageJson.scripts && packageJson.scripts['validate:autonomous']);
  
  // Test key dependencies
  test('next dependency exists', packageJson.dependencies && packageJson.dependencies.next);
  test('langchain dependency exists', packageJson.dependencies && packageJson.dependencies.langchain);
  test('@playwright/test dependency exists', packageJson.devDependencies && packageJson.devDependencies['@playwright/test']);
  
  console.log('\n🏗️ Build Tests');
  console.log('===============');
  
  // Test TypeScript compilation
  await testAsync('TypeScript compiles', new Promise((resolve, reject) => {
    exec('npx tsc --noEmit', (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || error.message));
      } else {
        resolve();
      }
    });
  }));
  
  // Test Next.js build
  await testAsync('Next.js build succeeds', new Promise((resolve, reject) => {
    exec('yarn build', { timeout: 120000 }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || error.message));
      } else {
        resolve();
      }
    });
  }));
  
  console.log('\n📊 Test Summary');
  console.log('================');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! The project is ready for local development.');
    console.log('🚀 Run "yarn dev" to start the development server.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the errors above and fix them before running the development server.');
  }
  
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(console.error);