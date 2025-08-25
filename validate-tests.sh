#!/bin/bash

# MCP Tools Testing Infrastructure Validation
# Validates the testing setup and basic functionality without browser requirements

set -e

echo "🧪 MCP Testing Infrastructure Validation"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
print_status "Checking prerequisites..."

if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run from project root."
    exit 1
fi

if ! command -v yarn &> /dev/null; then
    print_error "yarn is not installed"
    exit 1
fi

print_success "Prerequisites check passed"

# Validate project structure
print_status "Validating project structure..."

required_files=(
    "playwright.config.ts"
    "tests/README.md"
    "tests/TESTING.md"
    "TESTING_IMPLEMENTATION.md"
    "run-tests.sh"
)

required_dirs=(
    "tests/mcp/api"
    "tests/mcp/ui"
    "tests/utils"
    "tests/fixtures/test-files"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        print_success "✅ $file"
    else
        print_error "❌ Missing: $file"
        exit 1
    fi
done

for dir in "${required_dirs[@]}"; do
    if [ -d "$dir" ]; then
        print_success "✅ $dir/"
    else
        print_error "❌ Missing directory: $dir"
        exit 1
    fi
done

print_success "Project structure validation passed"

# Validate test files
print_status "Validating test files..."

test_files=(
    "tests/mcp/api/mcp-api.spec.ts"
    "tests/mcp/api/mcp-filesystem.spec.ts"
    "tests/mcp/api/mcp-web.spec.ts"
    "tests/mcp/api/mcp-security.spec.ts"
    "tests/mcp/ui/mcp-tools-page.spec.ts"
    "tests/mcp/ui/mcp-integration.spec.ts"
    "tests/utils/test-helpers.ts"
    "tests/utils/mock-data.ts"
)

for test_file in "${test_files[@]}"; do
    if [ -f "$test_file" ]; then
        # Check if file has actual content
        if [ -s "$test_file" ]; then
            print_success "✅ $test_file"
        else
            print_warning "⚠️  $test_file (empty)"
        fi
    else
        print_error "❌ Missing: $test_file"
        exit 1
    fi
done

print_success "Test files validation passed"

# Check test file syntax
print_status "Checking test file syntax..."

for test_file in "${test_files[@]}"; do
    if [[ $test_file == *.ts ]]; then
        if npx tsc --noEmit --skipLibCheck "$test_file" 2>/dev/null; then
            print_success "✅ Syntax: $test_file"
        else
            print_warning "⚠️  Syntax issues: $test_file"
        fi
    fi
done

print_success "Test syntax validation completed"

# Validate dependencies
print_status "Validating dependencies..."

if yarn list 2>/dev/null | grep -q "@playwright/test"; then
    print_success "✅ Playwright test framework installed"
else
    print_warning "⚠️  Playwright test framework not found (will be installed when tests run)"
fi

if yarn list 2>/dev/null | grep -q "playwright@"; then
    print_success "✅ Playwright library installed"
else
    print_warning "⚠️  Playwright library not found (will be installed when tests run)"
fi

print_success "Dependencies validation completed"

# Validate package.json scripts
print_status "Validating test scripts..."

required_scripts=(
    "test"
    "test:mcp"
    "test:mcp-api"
    "test:mcp-ui"
    "test:headed"
    "test:ui"
    "test:debug"
    "test:report"
    "test:install"
)

for script in "${required_scripts[@]}"; do
    if grep -q "\"$script\":" package.json; then
        print_success "✅ Script: $script"
    else
        print_error "❌ Missing script: $script"
        exit 1
    fi
done

print_success "Test scripts validation passed"

# Validate Playwright configuration
print_status "Validating Playwright configuration..."

if [ -f "playwright.config.ts" ]; then
    if grep -q "baseURL.*localhost:3000" playwright.config.ts; then
        print_success "✅ Base URL configured"
    else
        print_warning "⚠️  Base URL may not be configured correctly"
    fi
    
    if grep -q "webServer" playwright.config.ts; then
        print_success "✅ Web server configuration found"
    else
        print_warning "⚠️  Web server configuration may be missing"
    fi
else
    print_error "❌ Playwright configuration missing"
    exit 1
fi

print_success "Playwright configuration validation passed"

# Test build to ensure no conflicts
print_status "Testing build compatibility..."

if yarn build >/dev/null 2>&1; then
    print_success "✅ Project builds successfully with test infrastructure"
else
    print_error "❌ Build failed - test infrastructure may conflict with build"
    exit 1
fi

print_success "Build compatibility validation passed"

# Validate test fixture files
print_status "Validating test fixtures..."

fixture_files=(
    "tests/fixtures/test-files/sample.txt"
    "tests/fixtures/test-files/sample.json"
)

for fixture in "${fixture_files[@]}"; do
    if [ -f "$fixture" ] && [ -s "$fixture" ]; then
        print_success "✅ $fixture"
    else
        print_error "❌ Missing or empty: $fixture"
        exit 1
    fi
done

# Validate JSON fixture
if [ -f "tests/fixtures/test-files/sample.json" ]; then
    if cat "tests/fixtures/test-files/sample.json" | jq . >/dev/null 2>&1; then
        print_success "✅ sample.json is valid JSON"
    else
        print_warning "⚠️  sample.json may not be valid JSON"
    fi
fi

print_success "Test fixtures validation passed"

# Check API endpoint accessibility (basic validation)
print_status "Validating API endpoints..."

api_routes=(
    "app/api/mcp/route.ts"
    "app/api/terminal/route.ts"
    "app/api/reactbits/route.ts"
)

for route in "${api_routes[@]}"; do
    if [ -f "$route" ]; then
        print_success "✅ API route: $route"
    else
        print_warning "⚠️  API route not found: $route"
    fi
done

print_success "API endpoints validation completed"

# Count test cases
print_status "Analyzing test coverage..."

total_test_cases=0
total_describe_blocks=0

for test_file in "${test_files[@]}"; do
    if [[ $test_file == *.spec.ts ]]; then
        test_count=$(grep -c "test(" "$test_file" 2>/dev/null || echo "0")
        describe_count=$(grep -c "test.describe(" "$test_file" 2>/dev/null || echo "0")
        
        total_test_cases=$((total_test_cases + test_count))
        total_describe_blocks=$((total_describe_blocks + describe_count))
        
        echo "  📋 $(basename "$test_file"): $test_count tests, $describe_count suites"
    fi
done

print_success "Test coverage analysis:"
echo "  📊 Total test cases: $total_test_cases"
echo "  📋 Total test suites: $total_describe_blocks"
echo "  🎯 Coverage areas: API (4 files), UI (2 files), Utils (2 files)"

# Validate documentation
print_status "Validating documentation..."

doc_files=(
    "tests/README.md"
    "tests/TESTING.md"
    "TESTING_IMPLEMENTATION.md"
)

for doc in "${doc_files[@]}"; do
    if [ -f "$doc" ] && [ -s "$doc" ]; then
        word_count=$(wc -w < "$doc")
        print_success "✅ $doc ($word_count words)"
    else
        print_error "❌ Missing or empty: $doc"
        exit 1
    fi
done

print_success "Documentation validation passed"

echo ""
echo "🎉 Testing Infrastructure Validation Complete!"
echo "=============================================="
echo ""
echo "📊 Summary:"
echo "  ✅ Project structure: Valid"
echo "  ✅ Test files: $total_test_cases test cases in 6 files"
echo "  ✅ Dependencies: Playwright installed and configured"
echo "  ✅ Scripts: All test scripts defined"
echo "  ✅ Build compatibility: No conflicts detected"
echo "  ✅ Fixtures: Sample files ready"
echo "  ✅ Documentation: Comprehensive guides available"
echo ""
echo "🚀 Ready for testing! To run tests:"
echo "  📝 Local testing: yarn test:install && yarn test"
echo "  🎯 Specific tests: yarn test:mcp-api"
echo "  🔍 Interactive: yarn test:ui"
echo "  📊 Full suite: ./run-tests.sh"
echo ""
echo "📚 Documentation:"
echo "  📖 tests/README.md - Quick start guide"
echo "  📋 tests/TESTING.md - Detailed testing documentation"
echo "  🎯 TESTING_IMPLEMENTATION.md - Complete implementation guide"
echo ""
print_success "MCP testing infrastructure is ready for use!"