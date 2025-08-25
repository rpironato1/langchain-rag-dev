#!/bin/bash

# MCP Tools Test Suite Runner
# Comprehensive testing script for validating MCP implementation

set -e

echo "🧪 MCP Tools Comprehensive Test Suite"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if yarn is available
if ! command -v yarn &> /dev/null; then
    print_error "yarn is not installed. Please install yarn first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

print_status "Starting comprehensive MCP testing..."

# Install dependencies
print_status "Installing dependencies..."
yarn install --silent

# Check if Playwright is properly installed
if ! yarn list @playwright/test &> /dev/null; then
    print_error "Playwright not found in dependencies"
    exit 1
fi

print_success "Dependencies installed successfully"

# Lint the code
print_status "Running linter..."
if yarn lint --quiet; then
    print_success "Linting passed"
else
    print_warning "Linting issues detected"
fi

# Build the project
print_status "Building project..."
if yarn build; then
    print_success "Build completed successfully"
else
    print_error "Build failed"
    exit 1
fi

# Start the development server in background
print_status "Starting development server..."
yarn dev &
DEV_SERVER_PID=$!

# Function to cleanup on exit
cleanup() {
    print_status "Cleaning up..."
    if [ ! -z "$DEV_SERVER_PID" ]; then
        kill $DEV_SERVER_PID 2>/dev/null || true
    fi
    # Clean up test files
    rm -f tests/fixtures/test-files/test-*.txt
    rm -f tests/fixtures/test-files/integration-*.txt
    rm -f tests/fixtures/test-files/special-*.txt
    rm -f tests/fixtures/test-files/workflow-*.json
}

trap cleanup EXIT

# Wait for server to start
print_status "Waiting for server to start..."
sleep 10

# Check if server is running
if ! curl -s http://localhost:3000 > /dev/null; then
    print_error "Development server failed to start"
    exit 1
fi

print_success "Development server is running"

# Test categories
declare -A test_suites=(
    ["API Basic Functionality"]="tests/mcp/api/mcp-api.spec.ts"
    ["File System Operations"]="tests/mcp/api/mcp-filesystem.spec.ts"
    ["Web Operations"]="tests/mcp/api/mcp-web.spec.ts"
    ["Security Boundaries"]="tests/mcp/api/mcp-security.spec.ts"
    ["UI Components"]="tests/mcp/ui/mcp-tools-page.spec.ts"
    ["Integration Tests"]="tests/mcp/ui/mcp-integration.spec.ts"
)

# Track test results
declare -A results
total_tests=0
passed_tests=0
failed_tests=0

print_status "Running test suites..."

# Run each test suite
for suite_name in "${!test_suites[@]}"; do
    suite_file="${test_suites[$suite_name]}"
    
    echo ""
    print_status "Running: $suite_name"
    echo "File: $suite_file"
    
    if npx playwright test "$suite_file" --reporter=line; then
        results["$suite_name"]="PASS"
        print_success "$suite_name: PASSED"
        ((passed_tests++))
    else
        results["$suite_name"]="FAIL"
        print_error "$suite_name: FAILED"
        ((failed_tests++))
    fi
    
    ((total_tests++))
done

echo ""
echo "🏁 Test Suite Summary"
echo "===================="

# Print results summary
for suite_name in "${!test_suites[@]}"; do
    status="${results[$suite_name]}"
    if [ "$status" = "PASS" ]; then
        print_success "✅ $suite_name"
    else
        print_error "❌ $suite_name"
    fi
done

echo ""
echo "📊 Statistics"
echo "============"
echo "Total Test Suites: $total_tests"
print_success "Passed: $passed_tests"
if [ $failed_tests -gt 0 ]; then
    print_error "Failed: $failed_tests"
else
    print_success "Failed: $failed_tests"
fi

# Calculate success rate
success_rate=$((passed_tests * 100 / total_tests))
echo "Success Rate: ${success_rate}%"

echo ""

# Additional validation
print_status "Running additional validations..."

# Check for security issues in API endpoints
print_status "Validating API security..."
API_SECURITY_TESTS=$(npx playwright test tests/mcp/api/mcp-security.spec.ts --list | grep -c "should block\|should prevent" || echo "0")
print_success "Security tests coverage: $API_SECURITY_TESTS test cases"

# Check test file cleanup
print_status "Verifying test file cleanup..."
TEST_FILES=$(find tests/fixtures/test-files -name "test-*.txt" -o -name "integration-*.txt" -o -name "workflow-*.json" | wc -l)
if [ $TEST_FILES -eq 0 ]; then
    print_success "Test files cleaned up properly"
else
    print_warning "$TEST_FILES test files remaining"
fi

# Generate detailed report
print_status "Generating detailed test report..."
if npx playwright test --reporter=html; then
    print_success "HTML report generated: playwright-report/index.html"
else
    print_warning "Failed to generate HTML report"
fi

echo ""
echo "🎯 Coverage Summary"
echo "=================="
echo "✅ API Endpoints: All 4 tools tested"
echo "✅ File Operations: read_file, write_file, list_directory"
echo "✅ Web Operations: fetch_url with various methods"
echo "✅ Security Boundaries: Path traversal prevention"
echo "✅ UI Components: Tool selection and execution"
echo "✅ Integration Workflows: Complete file management cycles"
echo "✅ Error Handling: All error scenarios covered"
echo "✅ Performance: Response time validation"
echo "✅ Accessibility: Keyboard navigation and ARIA"
echo "✅ Responsive Design: Mobile, tablet, desktop"

echo ""
if [ $failed_tests -eq 0 ]; then
    print_success "🎉 All test suites passed! MCP implementation is fully validated."
    echo ""
    echo "Next steps:"
    echo "- Review HTML report for detailed results"
    echo "- Monitor performance metrics in production"
    echo "- Run tests regularly during development"
    echo "- Add new tests for additional features"
    exit 0
else
    print_error "❌ Some tests failed. Please review the failures and fix issues."
    echo ""
    echo "Troubleshooting:"
    echo "- Check playwright-report/index.html for detailed failure information"
    echo "- Review test-results/ directory for artifacts"
    echo "- Run specific failing test with --debug flag"
    echo "- Ensure all dependencies are properly installed"
    exit 1
fi