# Playwright Test Structure for MCP Tools

## Test Organization

```
tests/
  mcp/
    api/
      mcp-api.spec.ts           # Basic API endpoint tests
      mcp-filesystem.spec.ts    # File system operations tests
      mcp-web.spec.ts          # Web operations tests
      mcp-security.spec.ts     # Security boundary tests
    ui/
      mcp-tools-page.spec.ts   # UI component tests
      mcp-integration.spec.ts  # End-to-end integration tests
  utils/
    test-helpers.ts            # Shared test utilities
    mock-data.ts              # Test data and mocks
  fixtures/
    test-files/               # Sample files for testing
      sample.txt
      sample.json
```

## Running Tests

```bash
# Run all tests
yarn test

# Run specific test suite
yarn test:mcp

# Run with UI
yarn test:ui

# Run and generate report
yarn test:report
```