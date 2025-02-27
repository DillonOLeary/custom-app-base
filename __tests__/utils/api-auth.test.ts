// Import type NextRequest from next/server so TypeScript knows about it
import { NextRequest, NextResponse } from 'next/server';
import { validateToken } from '@/utils/api-auth';
import { copilotApi } from 'copilot-node-sdk';

// Mock next/server
jest.mock('next/server', () => {
  return {
    NextResponse: {
      json: jest.fn((body, options) => ({
        status: options?.status || 200,
        body,
      })),
    },
  };
});

// Mock copilotApi and token validation
jest.mock('copilot-node-sdk', () => ({
  copilotApi: jest.fn().mockImplementation(() => ({
    retrieveWorkspace: jest.fn().mockResolvedValue({}),
    getTokenPayload: jest.fn().mockResolvedValue({
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000) - 60,
      sub: 'test-user',
      workspaceId: 'test-workspace',
    }),
  })),
}));

// Mock token validation to always return success
jest.mock('@/utils/token-validation', () => ({
  validateAndExtractTokenClaims: jest.fn().mockResolvedValue({
    isValid: true,
    claims: {
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000) - 60,
      sub: 'test-user',
      workspaceId: 'test-workspace',
    },
  }),
  cleanupRateLimitStore: jest.fn(),
}));

// Create mock request factory function
const createMockRequest = (token?: string) => {
  const url = new URL('https://example.com');
  if (token) {
    url.searchParams.set('token', token);
  }

  return {
    url: url.toString(),
    // Provide just enough of the nextUrl interface for our validation function
    nextUrl: {
      searchParams: {
        get: (key: string) => url.searchParams.get(key),
      },
    },
  };
};

describe('API Authentication', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.COPILOT_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test('validates token successfully', async () => {
    const request = createMockRequest('valid-token');
    const { copilot, response } = await validateToken(request);

    // Should return copilot client and no error response
    expect(copilot).toBeTruthy();
    expect(response).toBeNull();

    // Should have called copilotApi with token
    expect(copilotApi).toHaveBeenCalledWith({
      apiKey: 'test-api-key',
      token: 'valid-token',
    });
  });

  test('returns error response when token is missing', async () => {
    const request = createMockRequest();
    const { copilot, response } = await validateToken(request);

    // Should return no client and an error response in production
    expect(copilot).toBeNull();
    expect(response).toBeTruthy();
    expect(response?.status).toBe(401);
  });

  test('skips validation in local environment', async () => {
    process.env.COPILOT_ENV = 'local';
    const request = createMockRequest();
    const { copilot, response } = await validateToken(request);

    // Should return copilot client and no error response
    expect(copilot).toBeTruthy();
    expect(response).toBeNull();
  });

  test('skips validation in development environment', async () => {
    // Using Object.defineProperty to modify read-only property for testing
    const originalNodeEnv = process.env.NODE_ENV;
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'development',
      configurable: true,
    });

    const request = createMockRequest();
    const { copilot, response } = await validateToken(request);

    // Should return copilot client and no error response
    expect(copilot).toBeTruthy();
    expect(response).toBeNull();

    // Restore the original NODE_ENV
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: originalNodeEnv,
      configurable: true,
    });
  });
});
