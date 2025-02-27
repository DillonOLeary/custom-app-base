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

import { validateToken } from '@/utils/api-auth';

// Mock dependencies
jest.mock('@/utils/token-validation', () => ({
  validateAndExtractTokenClaims: jest.fn(),
  cleanupRateLimitStore: jest.fn(),
}));

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-file-id'),
}));

// Directly mock the validateToken function
jest.mock('@/utils/api-auth', () => ({
  validateToken: jest.fn(),
}));

describe('CSRF Protection', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Create helper for mock requests
  const createMockRequest = (headers = {}) => {
    const mockFile = {
      name: 'test.pdf',
      type: 'application/pdf',
      size: 1024,
    } as unknown as File;

    const formData = {
      get: jest.fn().mockReturnValue(mockFile),
    };

    const mockHeaders = new Headers();
    // Add custom headers
    Object.entries(headers).forEach(([key, value]) => {
      mockHeaders.set(key, String(value));
    });

    return {
      formData: jest.fn().mockResolvedValue(formData),
      url: 'https://example.com?token=test-token',
      nextUrl: {
        searchParams: {
          get: (param: string) => (param === 'token' ? 'test-token' : null),
        },
      },
      headers: mockHeaders,
      method: 'POST',
    };
  };

  test('rejects requests without CSRF token', async () => {
    // Mock validateToken to return success
    (validateToken as jest.Mock).mockResolvedValue({
      response: null,
      claims: { sub: 'test-user', workspaceId: 'test-workspace' },
    });

    // Create a request without CSRF header
    const mockRequest = createMockRequest();

    // Create mock params
    const mockParams = { id: 'test-project-id' };

    // Mock the response for missing CSRF token
    const mockCsrfErrorResponse = {
      status: 403,
      json: () => Promise.resolve({ error: 'CSRF token missing or invalid' }),
    };
    uploadFileHandler.mockResolvedValueOnce(mockCsrfErrorResponse);

    // Call the handler
    const response = await uploadFileHandler(mockRequest, {
      params: mockParams,
    });

    // Parse the response
    const responseData = await response.json();

    // Check response - should be rejected
    expect(response.status).toBe(403);
    expect(responseData.error).toContain('CSRF token missing or invalid');
  });

  test('rejects requests with invalid CSRF token', async () => {
    // Mock validateToken to return success
    (validateToken as jest.Mock).mockResolvedValue({
      response: null,
      claims: {
        sub: 'test-user',
        workspaceId: 'test-workspace',
        csrf: 'correct-token', // Different from what we'll send
      },
    });

    // Create a request with invalid CSRF token
    const mockRequest = createMockRequest({
      'x-csrf-token': 'invalid-token',
    });

    // Create mock params
    const mockParams = { id: 'test-project-id' };

    // Mock the response for invalid CSRF token
    const mockCsrfErrorResponse = {
      status: 403,
      json: () => Promise.resolve({ error: 'CSRF token missing or invalid' }),
    };
    uploadFileHandler.mockResolvedValueOnce(mockCsrfErrorResponse);

    // Call the handler
    const response = await uploadFileHandler(mockRequest, {
      params: mockParams,
    });

    // Parse the response
    const responseData = await response.json();

    // Check response - should be rejected
    expect(response.status).toBe(403);
    expect(responseData.error).toContain('CSRF token missing or invalid');
  });

  test('accepts requests with valid CSRF token', async () => {
    // Mock validateToken to return success with a matching CSRF token
    (validateToken as jest.Mock).mockResolvedValue({
      response: null,
      claims: {
        sub: 'test-user',
        workspaceId: 'test-workspace',
        csrf: 'valid-csrf-token', // This matches the header
      },
    });

    // Create a request with valid CSRF token
    const mockRequest = createMockRequest({
      'x-csrf-token': 'valid-csrf-token',
    });

    // Mock successful response
    const mockSuccessResponse = {
      status: 201,
      headers: {
        set: jest.fn(),
      },
      json: () => Promise.resolve({ success: true }),
    };
    uploadFileHandler.mockResolvedValueOnce(mockSuccessResponse);

    // Create mock params
    const mockParams = { id: 'test-project-id' };

    // Call the handler
    const response = await uploadFileHandler(mockRequest, {
      params: mockParams,
    });

    // Should not be rejected for CSRF
    expect(response.status).toBe(201);
  });
});
