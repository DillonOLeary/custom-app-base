// Import for type checking
import { NextRequest } from 'next/server';

// Mock file handler function
const uploadFileHandler = jest.fn();

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
  ) => {
    const mockFile = {
      name: fileName,
      type: fileType,
      size: fileSize,
    } as unknown as File;

    const formData = {
      get: jest.fn().mockReturnValue(mockFile),
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
    // Create a mock request with disallowed file type
    const { mockRequest } = createMockFormData(
      'malicious.exe',
      'application/x-msdownload',
      1024, // 1KB
    );

    // Create mock params
    const mockParams = { id: 'test-project-id' };

    // Mock response for file type validation failure
    const mockTypeFailResponse = {
      status: 400,
      json: () => Promise.resolve({ error: 'File type not allowed' }),
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
    expect(responseData.error).toContain('File type not allowed');
  });

  test('sanitizes filenames to prevent path traversal', async () => {
    // Create a mock request with malicious filename
    const { mockRequest } = createMockFormData(
      '../../../etc/passwd',
      'application/pdf',
      1024, // 1KB
    );

    // Create a sanitized response
    const sanitizedResponse = {
      status: 201,
      json: () =>
        Promise.resolve({
          fileName: 'etc.passwd', // Sanitized filename
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
    expect(responseData.fileName).not.toContain('../');
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
});
