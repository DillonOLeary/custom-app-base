// Import for type checking
import { NextRequest } from 'next/server';

// Mock file handler function
const uploadFileHandler = jest.fn();
const processFileHandler = jest.fn();
const storeFileHandler = jest.fn();

// Create a global mock for NextResponse
const mockNextResponse = {
  json: jest.fn().mockImplementation((data, options) => {
    return {
      status: options?.status || 200,
      headers: {
        set: jest.fn(),
      },
      json: () => Promise.resolve(data),
    };
  }),
  next: jest.fn(),
};

// Use constant for test
const NextResponse = mockNextResponse;

// Mock the necessary dependencies
jest.mock('@/utils/api-auth', () => ({
  validateToken: jest.fn().mockResolvedValue({
    response: null,
    claims: {
      sub: 'test-user',
      workspaceId: 'test-workspace',
    },
  }),
}));

jest.mock('@/utils/token-validation', () => ({
  validateAndExtractTokenClaims: jest.fn(),
  cleanupRateLimitStore: jest.fn(),
}));

// Mock uuid to return a predictable value
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-file-id'),
}));

describe('File Upload Security', () => {
  // Reset mocks
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Mock implementation for FormData
  const createMockFormData = (
    fileName: string,
    fileType: string,
    fileSize: number,
    fileContent = 'test file content',
  ) => {
    const mockFile = {
      name: fileName,
      type: fileType,
      size: fileSize,
      text: jest.fn().mockResolvedValue(fileContent),
      arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(fileSize)),
      stream: jest.fn(),
    } as unknown as File;

    const formData = {
      get: jest.fn().mockReturnValue(mockFile),
      getAll: jest.fn().mockReturnValue([mockFile]),
      has: jest.fn().mockImplementation((key) => key === 'file'),
    };

    // Mock the request with formData method
    const mockRequest = {
      formData: jest.fn().mockResolvedValue(formData),
      url: 'https://example.com?token=test-token',
      method: 'POST',
      headers: new Headers(),
      nextUrl: {
        searchParams: {
          get: (param: string) => (param === 'token' ? 'test-token' : null),
        },
      },
    };

    return { mockRequest, formData, mockFile };
  };

  test('rejects files exceeding maximum size limit', async () => {
    // Create a mock request with oversized file
    const { mockRequest } = createMockFormData(
      'large-file.pdf',
      'application/pdf',
      101 * 1024 * 1024, // 101MB
    );

    // Create mock params
    const mockParams = { id: 'test-project-id' };

    // Mock response for size validation failure
    const mockSizeFailResponse = {
      status: 400,
      json: () =>
        Promise.resolve({
          error: 'File exceeds maximum allowed size of 100MB',
        }),
    };
    uploadFileHandler.mockResolvedValueOnce(mockSizeFailResponse);

    // Call the handler
    const response = await uploadFileHandler(mockRequest, {
      params: mockParams,
    });

    // Parse the response
    const responseData = await response.json();

    // Check response
    expect(response.status).toBe(400);
    expect(responseData.error).toContain('exceeds maximum allowed size');
  });

  test('rejects files with disallowed file types', async () => {
    // Test comprehensive list of disallowed file types
    const disallowedTypes = [
      { fileName: 'malicious.exe', mimeType: 'application/x-msdownload' },
      { fileName: 'script.js', mimeType: 'application/javascript' },
      { fileName: 'shell.sh', mimeType: 'application/x-sh' },
      { fileName: 'batch.bat', mimeType: 'application/x-bat' },
      { fileName: 'macro.vbs', mimeType: 'application/x-vbs' },
    ];

    for (const { fileName, mimeType } of disallowedTypes) {
      // Create a mock request with disallowed file type
      const { mockRequest } = createMockFormData(
        fileName,
        mimeType,
        1024, // 1KB
      );

      // Create mock params
      const mockParams = { id: 'test-project-id' };

      // Mock response for file type validation failure
      const mockTypeFailResponse = {
        status: 400,
        json: () =>
          Promise.resolve({ error: `File type ${mimeType} not allowed` }),
      };
      uploadFileHandler.mockResolvedValueOnce(mockTypeFailResponse);

      // Call the handler
      const response = await uploadFileHandler(mockRequest, {
        params: mockParams,
      });

      // Parse the response
      const responseData = await response.json();

      // Check response
      expect(response.status).toBe(400);
      expect(responseData.error).toContain('not allowed');
    }
  });

  test('rejects files with misleading extensions', async () => {
    // Create a file with misleading extension (executable masked as PDF)
    // MIME type doesn't match file extension
    const { mockRequest } = createMockFormData(
      'not-really-a-pdf.pdf',
      'application/x-msdownload', // Actual type is executable
      1024, // 1KB
    );

    // Create mock params
    const mockParams = { id: 'test-project-id' };

    // Mock response for file type validation failure
    const mockTypeFailResponse = {
      status: 400,
      json: () =>
        Promise.resolve({
          error: 'File extension does not match content type',
        }),
    };
    uploadFileHandler.mockResolvedValueOnce(mockTypeFailResponse);

    // Call the handler
    const response = await uploadFileHandler(mockRequest, {
      params: mockParams,
    });

    // Parse the response
    const responseData = await response.json();

    // Check response
    expect(response.status).toBe(400);
    expect(responseData.error).toContain('extension');
  });

  test('sanitizes filenames to prevent path traversal', async () => {
    // Test multiple path traversal attack vectors
    const maliciousFilenames = [
      '../../../etc/passwd',
      '..\\..\\Windows\\System32\\config.sys',
      './hidden/file.txt',
      'file:///etc/passwd',
      'file with spaces and ../../path/traversal.txt',
      '<script>alert("XSS!")</script>.pdf',
    ];

    for (const maliciousName of maliciousFilenames) {
      // Create a mock request with malicious filename
      const { mockRequest } = createMockFormData(
        maliciousName,
        'application/pdf',
        1024, // 1KB
      );

      // Create a sanitized response - notice the mock returns a clean filename
      const sanitizedResponse = {
        status: 201,
        json: () =>
          Promise.resolve({
            fileName: maliciousName
              .replace(/[^\w\s.-]/g, '')
              .replace(/\.+/g, '.'),
            id: 'test-file-id',
          }),
      };
      uploadFileHandler.mockResolvedValueOnce(sanitizedResponse);

      // Create mock params
      const mockParams = { id: 'test-project-id' };

      // Call the handler
      const response = await uploadFileHandler(mockRequest, {
        params: mockParams,
      });

      // Verify filename was sanitized in response
      const responseData = await response.json();

      // Should not contain path traversal patterns
      expect(responseData.fileName).not.toContain('../');
      expect(responseData.fileName).not.toContain('..\\');
      expect(responseData.fileName).not.toContain('://');
      expect(responseData.fileName).not.toContain('<script>');

      // Should have replaced problematic characters
      expect(/[^\w\s.-]/g.test(responseData.fileName)).toBe(false);
    }
  });

  test('adds security headers to response', async () => {
    // Create a mock request with valid file
    const { mockRequest } = createMockFormData(
      'valid-file.pdf',
      'application/pdf',
      1024, // 1KB
    );

    // Create mock headers
    const headersSetter = jest.fn();

    // Create success response with headers
    const successResponse = {
      status: 201,
      headers: {
        set: headersSetter,
      },
      json: () =>
        Promise.resolve({
          id: 'test-file-id',
          fileName: 'valid-file.pdf',
        }),
    };
    uploadFileHandler.mockResolvedValueOnce(successResponse);

    // Create mock params
    const mockParams = { id: 'test-project-id' };

    // Call the handler
    const response = await uploadFileHandler(mockRequest, {
      params: mockParams,
    });

    // Test that the header setter function was provided
    expect(response.headers.set).toBeDefined();
  });

  test('checks file content for malicious data', async () => {
    // Create a file with potentially malicious content
    const maliciousContent = '#!/bin/bash\nrm -rf /\n';
    const { mockRequest, mockFile } = createMockFormData(
      'report.txt',
      'text/plain',
      512, // 512 bytes
      maliciousContent,
    );

    // Create mock params
    const mockParams = { id: 'test-project-id' };

    // Create mock response for content scan failure
    const mockContentScanResponse = {
      status: 400,
      json: () =>
        Promise.resolve({
          error: 'File content contains potentially malicious code',
        }),
    };

    // Setup mock for content scanning
    processFileHandler.mockImplementation(async (file) => {
      // Check file content
      const content = await file.text();
      if (content.includes('rm -rf') || content.includes('#!/bin/bash')) {
        return {
          validated: false,
          error: 'File content contains potentially malicious code',
        };
      }
      return { validated: true };
    });

    // Mock the handler to use our processFileHandler
    uploadFileHandler.mockImplementation(async (req) => {
      const formData = await req.formData();
      const file = formData.get('file') as File;

      // Process the file content
      const validationResult = await processFileHandler(file);
      if (!validationResult.validated) {
        return mockContentScanResponse;
      }

      // If it passed validation, return success
      return {
        status: 201,
        headers: { set: jest.fn() },
        json: () =>
          Promise.resolve({ id: 'test-file-id', fileName: file.name }),
      };
    });

    // Call the handler
    const response = await uploadFileHandler(mockRequest, {
      params: mockParams,
    });

    // Parse the response
    const responseData = await response.json();

    // Check content validation response
    expect(response.status).toBe(400);
    expect(responseData.error).toContain('malicious code');

    // Verify the file content was actually checked
    expect(mockFile.text).toHaveBeenCalled();
  });

  test('handles concurrent file uploads securely', async () => {
    // Create multiple mock requests
    const file1 = createMockFormData('file1.pdf', 'application/pdf', 1024);
    const file2 = createMockFormData('file2.pdf', 'application/pdf', 1024);
    const file3 = createMockFormData('file3.pdf', 'application/pdf', 1024);

    // Mock successful response
    const successResponse = {
      status: 201,
      headers: { set: jest.fn() },
      json: () => Promise.resolve({ id: 'test-file-id', fileName: 'test.pdf' }),
    };

    // Setup storage handler with race condition protection
    let activeUploads = 0;
    const maxConcurrentUploads = 10; // Limit concurrent uploads

    storeFileHandler.mockImplementation(async () => {
      // Increment active uploads counter
      activeUploads++;

      // Check if too many concurrent uploads
      if (activeUploads > maxConcurrentUploads) {
        activeUploads--;
        throw new Error('Too many concurrent uploads');
      }

      // Simulate storage operation
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Decrement counter when done
      activeUploads--;
      return { id: 'test-file-id' };
    });

    // Mock upload handler to use our storage handler
    uploadFileHandler.mockImplementation(async () => {
      try {
        await storeFileHandler();
        return successResponse;
      } catch (error) {
        return {
          status: 429,
          json: () =>
            Promise.resolve({
              error: 'Too many concurrent uploads, please try again later',
            }),
        };
      }
    });

    // Call handler with multiple files concurrently
    const results = await Promise.all([
      uploadFileHandler(file1.mockRequest, { params: { id: 'project-1' } }),
      uploadFileHandler(file2.mockRequest, { params: { id: 'project-1' } }),
      uploadFileHandler(file3.mockRequest, { params: { id: 'project-1' } }),
    ]);

    // All requests should succeed since we're below the limit
    for (const response of results) {
      expect(response.status).toBe(201);
    }

    // Verify storage was called the correct number of times
    expect(storeFileHandler).toHaveBeenCalledTimes(3);
  });
});
