// Mock Next.js types
jest.mock('next/server', () => {
  const NextResponse = {
    json: jest.fn().mockImplementation((data, options) => {
      return {
        status: options?.status || 200,
        headers: new Map(),
        json: () => Promise.resolve(data)
      };
    }),
    next: jest.fn().mockReturnValue({
      headers: new Map(),
      status: 200
    })
  };
  
  return {
    NextRequest: jest.fn(),
    NextResponse
  };
});

// Mock the necessary dependencies
jest.mock('@/utils/api-auth', () => ({
  validateToken: jest.fn().mockResolvedValue({
    response: null,
    claims: {
      sub: 'test-user',
      workspaceId: 'test-workspace'
    }
  })
}));

jest.mock('@/utils/token-validation', () => ({
  validateAndExtractTokenClaims: jest.fn(),
  cleanupRateLimitStore: jest.fn()
}));

// Mock uuid to return a predictable value
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-file-id')
}));

describe('File Upload Security', () => {
  // Reset mocks
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Mock implementation for FormData
  const createMockFormData = (fileName: string, fileType: string, fileSize: number) => {
    const mockFile = {
      name: fileName,
      type: fileType,
      size: fileSize
    } as unknown as File;

    const formData = {
      get: jest.fn().mockReturnValue(mockFile)
    };

    // Mock the request with formData method
    const mockRequest = {
      formData: jest.fn().mockResolvedValue(formData),
      url: 'https://example.com?token=test-token',
      nextUrl: {
        searchParams: {
          get: (param: string) => param === 'token' ? 'test-token' : null
        }
      }
    } as unknown as NextRequest;

    return { mockRequest, formData, mockFile };
  };

  test('rejects files exceeding maximum size limit', async () => {
    // Create a mock request with oversized file
    const { mockRequest } = createMockFormData(
      'large-file.pdf',
      'application/pdf',
      101 * 1024 * 1024 // 101MB
    );

    // Create mock params
    const mockParams = { id: 'test-project-id' };

    // Call the handler
    const response = await uploadFileHandler(mockRequest, { params: mockParams });
    
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
      1024 // 1KB
    );

    // Create mock params
    const mockParams = { id: 'test-project-id' };

    // Call the handler
    const response = await uploadFileHandler(mockRequest, { params: mockParams });
    
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
      1024 // 1KB
    );

    // Mock NextResponse.json to capture the created file
    const mockJsonResponse = { status: 201 };
    const originalJson = NextResponse.json;
    // @ts-ignore
    NextResponse.json = jest.fn().mockImplementation(data => {
      expect(data.fileName).not.toContain('../');
      expect(data.fileName).toBe('...etc.passwd');
      return { 
        ...mockJsonResponse, 
        json: () => Promise.resolve(data),
        headers: new Headers()
      };
    });

    // Create mock params
    const mockParams = { id: 'test-project-id' };

    // Call the handler
    await uploadFileHandler(mockRequest, { params: mockParams });
    
    // Verify NextResponse.json was called with sanitized filename
    expect(NextResponse.json).toHaveBeenCalled();
    
    // Restore original implementation
    // @ts-ignore
    NextResponse.json = originalJson;
  });

  test('adds security headers to response', async () => {
    // Create a mock request with valid file
    const { mockRequest } = createMockFormData(
      'valid-file.pdf',
      'application/pdf',
      1024 // 1KB
    );

    // Mock headers
    const mockHeaders = new Map();
    const headersSetter = jest.fn((key, value) => {
      mockHeaders.set(key, value);
      return undefined;
    });

    // Mock NextResponse.json
    const mockJsonResponse = { 
      status: 201,
      headers: {
        set: headersSetter
      }
    };
    const originalJson = NextResponse.json;
    // @ts-ignore
    NextResponse.json = jest.fn().mockReturnValue(mockJsonResponse);

    // Create mock params
    const mockParams = { id: 'test-project-id' };

    // Call the handler
    await uploadFileHandler(mockRequest, { params: mockParams });
    
    // Verify security headers were set
    expect(headersSetter).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
    expect(headersSetter).toHaveBeenCalledWith('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    
    // Restore original implementation
    // @ts-ignore
    NextResponse.json = originalJson;
  });
});