export const mockMCPTools = [
  {
    name: 'read_file',
    description: 'Read contents of a file',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Path to the file to read' }
      },
      required: ['path']
    }
  },
  {
    name: 'write_file',
    description: 'Write content to a file',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Path to the file to write' },
        content: { type: 'string', description: 'Content to write to the file' }
      },
      required: ['path', 'content']
    }
  },
  {
    name: 'list_directory',
    description: 'List contents of a directory',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Path to the directory to list' }
      },
      required: ['path']
    }
  },
  {
    name: 'fetch_url',
    description: 'Fetch content from a URL',
    parameters: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL to fetch' },
        method: { type: 'string', enum: ['GET', 'POST'], default: 'GET' },
        headers: { type: 'object', description: 'Request headers' },
        body: { type: 'string', description: 'Request body for POST requests' }
      },
      required: ['url']
    }
  }
];

export const mockFileSystemResults = {
  readFileSuccess: {
    success: true,
    content: 'Sample file content',
    path: 'test.txt'
  },
  writeFileSuccess: {
    success: true,
    path: 'test.txt',
    size: 18
  },
  listDirectorySuccess: {
    success: true,
    contents: [
      { name: 'file1.txt', type: 'file' as const, path: 'test/file1.txt' },
      { name: 'file2.txt', type: 'file' as const, path: 'test/file2.txt' },
      { name: 'subdir', type: 'directory' as const, path: 'test/subdir' }
    ],
    path: 'test'
  },
  fileNotFound: {
    success: false,
    error: 'ENOENT: no such file or directory'
  },
  accessDenied: {
    success: false,
    error: 'Access denied: Path outside project directory'
  }
};

export const mockWebResults = {
  fetchSuccess: {
    success: true,
    status: 200,
    statusText: 'OK',
    headers: {
      'content-type': 'application/json',
      'content-length': '42'
    },
    content: '{"message": "Hello World", "status": "ok"}'
  },
  fetchNotFound: {
    success: true,
    status: 404,
    statusText: 'Not Found',
    headers: {
      'content-type': 'text/html'
    },
    content: '<!DOCTYPE html><html><head><title>404</title></head><body>Not Found</body></html>'
  },
  fetchError: {
    success: false,
    error: 'Network error: Failed to fetch'
  }
};

export const testUrls = {
  validJson: 'https://jsonplaceholder.typicode.com/posts/1',
  notFound: 'https://httpstat.us/404',
  serverError: 'https://httpstat.us/500',
  timeout: 'https://httpstat.us/200?sleep=35000', // 35 second timeout
  malformed: 'not-a-valid-url'
};

export const testPaths = {
  validFile: './package.json',
  validDirectory: './app',
  nonExistent: './non-existent-file.txt',
  outsideProject: '../../../etc/passwd',
  dotFile: './.env',
  nestedPath: './app/api/mcp/route.ts'
};

export const testContent = {
  simpleText: 'Hello, World!',
  jsonData: JSON.stringify({ test: true, timestamp: Date.now() }),
  htmlContent: '<!DOCTYPE html><html><head><title>Test</title></head><body><h1>Test Page</h1></body></html>',
  largePLainText: 'Lorem ipsum '.repeat(1000),
  binaryLike: '\x00\x01\x02\x03\xFF\xFE\xFD',
  emptyString: '',
  unicodeText: '🚀 Testing Unicode: àáâãäåæçèéêë 中文 العربية',
  multilineText: `Line 1
Line 2
Line 3
Final line`
};

export const securityTestCases = [
  {
    name: 'Path traversal with ../',
    path: '../../../etc/passwd',
    shouldFail: true,
    expectedError: 'Access denied: Path outside project directory'
  },
  {
    name: 'Absolute path outside project',
    path: '/etc/passwd',
    shouldFail: true,
    expectedError: 'Access denied: Path outside project directory'
  },
  {
    name: 'Windows-style path traversal',
    path: '..\\..\\..\\Windows\\System32\\config\\SAM',
    shouldFail: true,
    expectedError: 'Access denied: Path outside project directory'
  },
  {
    name: 'URL-encoded path traversal',
    path: '%2E%2E%2F%2E%2E%2Fetc%2Fpasswd',
    shouldFail: true,
    expectedError: 'Access denied: Path outside project directory'
  },
  {
    name: 'Valid relative path',
    path: './package.json',
    shouldFail: false
  },
  {
    name: 'Valid nested path',
    path: './app/api/mcp/route.ts',
    shouldFail: false
  }
];

export const performanceTestCases = [
  {
    name: 'Small file (< 1KB)',
    content: testContent.simpleText,
    expectedMaxTime: 100
  },
  {
    name: 'Medium file (1-10KB)',
    content: testContent.largePLainText,
    expectedMaxTime: 200
  },
  {
    name: 'Large text content',
    content: testContent.simpleText.repeat(10000),
    expectedMaxTime: 500
  }
];

export const errorTestCases = [
  {
    name: 'Invalid JSON body',
    body: 'invalid json',
    expectedStatus: 400,
    expectedError: 'Invalid request body'
  },
  {
    name: 'Missing tool name',
    body: { parameters: {} },
    expectedStatus: 400,
    expectedError: 'Tool name is required'
  },
  {
    name: 'Unknown tool',
    body: { tool: 'unknown_tool', parameters: {} },
    expectedStatus: 404,
    expectedError: "Tool 'unknown_tool' not found"
  },
  {
    name: 'Invalid parameters',
    body: { tool: 'read_file', parameters: { invalid: 'param' } },
    expectedStatus: 500,
    expectedError: 'no such file or directory'
  }
];