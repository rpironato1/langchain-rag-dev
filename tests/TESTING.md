# MCP Tools Comprehensive Testing Guide

## Overview

This testing suite provides comprehensive coverage for the MCP (Model Context Protocol) tools implementation using Playwright. The tests are designed to validate functionality, security, performance, and user experience across all MCP operations.

## Test Structure

```
tests/
├── mcp/
│   ├── api/                     # API endpoint tests
│   │   ├── mcp-api.spec.ts     # Basic API functionality
│   │   ├── mcp-filesystem.spec.ts # File system operations
│   │   ├── mcp-web.spec.ts     # Web/HTTP operations
│   │   └── mcp-security.spec.ts # Security boundary tests
│   └── ui/                      # User interface tests
│       ├── mcp-tools-page.spec.ts # UI component tests
│       └── mcp-integration.spec.ts # End-to-end workflows
├── utils/
│   ├── test-helpers.ts         # Shared testing utilities
│   └── mock-data.ts           # Test data and scenarios
└── fixtures/
    └── test-files/            # Sample files for testing
        ├── sample.txt
        └── sample.json
```

## Test Categories

### 1. API Functionality Tests (`mcp-api.spec.ts`)
- **Tool Discovery**: Validates GET endpoint returns available tools
- **Schema Validation**: Ensures tool schemas are properly structured
- **Error Handling**: Tests malformed requests, missing parameters
- **Concurrent Requests**: Validates API handles multiple simultaneous requests
- **Response Timing**: Ensures reasonable response times

**Key Test Cases:**
- Tool list retrieval and validation
- JSON schema compliance
- Error response formats
- Request parameter preservation
- Timestamp inclusion

### 2. File System Operations (`mcp-filesystem.spec.ts`)
- **Read Operations**: Test file reading with various content types
- **Write Operations**: Validate file creation and modification
- **Directory Listing**: Test directory enumeration
- **Error Handling**: File not found, permission issues
- **Performance**: Large file handling, concurrent operations

**Key Test Cases:**
- Reading text, JSON, and binary files
- Writing with Unicode content
- Directory traversal and listing
- File integrity across operations
- Performance benchmarks

### 3. Web Operations (`mcp-web.spec.ts`)
- **HTTP Methods**: GET, POST request handling
- **Content Types**: JSON, HTML, XML response processing
- **Status Codes**: Proper handling of 2xx, 4xx, 5xx responses
- **Headers**: Custom header support and response header preservation
- **Error Scenarios**: Network failures, timeouts, invalid URLs

**Key Test Cases:**
- JSON API consumption
- HTML content fetching
- Custom headers and POST data
- Error handling for network issues
- Concurrent web requests

### 4. Security Boundaries (`mcp-security.spec.ts`)
- **Path Traversal Protection**: Prevents access outside project directory
- **Malicious Path Handling**: URL encoding, null bytes, Windows paths
- **System File Protection**: Blocks access to sensitive system files
- **Edge Cases**: Empty paths, special characters, long paths
- **Concurrent Security**: Security under concurrent access attempts

**Key Test Cases:**
- `../../../etc/passwd` prevention
- URL-encoded path traversal blocking
- Windows-style path traversal protection
- Device file access prevention
- Symlink security handling

### 5. UI Component Tests (`mcp-tools-page.spec.ts`)
- **Tool Selection**: Interactive tool selection and parameter display
- **Form Validation**: Required field validation and input handling
- **Execution Flow**: Loading states, success/error display
- **Responsive Design**: Mobile, tablet, desktop compatibility
- **Accessibility**: Keyboard navigation, screen reader support

**Key Test Cases:**
- Tool list display and selection
- Parameter input handling
- Execution feedback and results
- Error message display
- Responsive layout validation

### 6. Integration Tests (`mcp-integration.spec.ts`)
- **Complete Workflows**: End-to-end file management scenarios
- **Multi-Tool Operations**: Complex operations using multiple tools
- **State Management**: UI state consistency across operations
- **Performance**: Large operations and concurrent usage
- **Edge Cases**: Special characters, long operations

**Key Test Cases:**
- Write → Read → List workflow
- Special character handling
- Complex JSON operations
- Concurrent operation handling
- Error recovery scenarios

## Security Testing

### Path Traversal Prevention
```typescript
// Test cases include:
- ../../../etc/passwd
- /etc/passwd  
- ..\\..\\..\\Windows\\System32
- %2E%2E%2F%2E%2E%2Fetc%2Fpasswd
- /proc/version
- /dev/null
```

### Validation Scenarios
- All paths must resolve within project directory
- URL encoding attempts are blocked
- Windows and Unix path traversal prevention
- Special file system locations are protected

## Performance Testing

### Benchmarks
- **Small files (< 1KB)**: < 100ms processing
- **Medium files (1-10KB)**: < 200ms processing  
- **Large content**: < 500ms processing
- **API response time**: < 1000ms
- **Web requests**: < 10000ms timeout

### Load Testing
- Concurrent file operations
- Multiple simultaneous web requests
- UI responsiveness under load
- Memory usage with large files

## Error Handling Coverage

### File System Errors
- File not found (ENOENT)
- Permission denied (EACCES)
- Path outside project directory
- Invalid file paths

### Web Request Errors
- DNS resolution failures
- Connection timeouts
- HTTP error status codes
- Malformed URLs
- Network interruptions

### UI Error States
- Network request failures
- Invalid form inputs
- Loading state management
- Error message display

## Test Data and Fixtures

### Sample Files
- **sample.txt**: Multi-line text with special characters
- **sample.json**: Valid JSON with Unicode content
- **Dynamic files**: Created during tests for write operations

### Mock Data
- Tool definitions and schemas
- Expected response formats
- Error scenarios and messages
- Performance test data sets

## Running Tests

### Prerequisites
```bash
# Install dependencies
yarn install

# Install Playwright browsers (local development only)
yarn test:install
```

### Test Execution
```bash
# Run all tests
yarn test

# Run specific test suites
yarn test:mcp           # All MCP tests
yarn test:mcp-api       # API tests only
yarn test:mcp-ui        # UI tests only

# Interactive modes
yarn test:headed        # Run with browser visible
yarn test:ui           # Interactive UI mode
yarn test:debug        # Debug mode

# Generate reports
yarn test:report       # View test results
```

### Test Configuration
Tests are configured to:
- Run against `http://localhost:3000`
- Start dev server automatically
- Use multiple browser engines (Chromium, Firefox, WebKit)
- Generate HTML reports
- Capture traces on failures

## Test-Driven Development Approach

### Implementation Cycle
1. **Write failing tests** for new functionality
2. **Implement minimal code** to make tests pass
3. **Refactor** while maintaining test coverage
4. **Add edge case tests** for robustness
5. **Performance test** critical paths

### Coverage Goals
- **API Endpoints**: 100% path coverage
- **Error Scenarios**: All error conditions tested
- **Security Boundaries**: All attack vectors covered
- **UI Components**: All user interactions tested
- **Integration Flows**: All workflows validated

## Continuous Integration

### Test Strategy
- **Pre-commit**: Lint and type checking
- **Pull Request**: Full test suite execution
- **Deployment**: Security and integration tests
- **Monitoring**: Performance regression detection

### Quality Gates
- All tests must pass
- No security vulnerabilities
- Performance benchmarks met
- Accessibility standards compliance

## Troubleshooting

### Common Issues
1. **Port conflicts**: Ensure port 3000 is available
2. **Network timeouts**: Check internet connectivity for web tests
3. **File permissions**: Verify write access to test directories
4. **Browser installation**: Run `yarn test:install` if browsers missing

### Debug Techniques
- Use `yarn test:debug` for step-by-step debugging
- Check `test-results/` directory for failure artifacts
- Review HTML report for detailed failure information
- Use browser developer tools in headed mode

## Contributing

### Adding New Tests
1. Follow existing naming conventions
2. Use shared utilities from `test-helpers.ts`
3. Include both positive and negative test cases
4. Document complex test scenarios
5. Ensure tests are deterministic and isolated

### Test Guidelines
- **Descriptive names**: Clear test descriptions
- **Isolated tests**: No dependencies between tests
- **Cleanup**: Proper test data cleanup
- **Assertions**: Meaningful assertion messages
- **Performance**: Reasonable test execution time