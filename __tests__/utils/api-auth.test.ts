// Mocking next/server functionality
import { NextResponse } from 'next/server';

// Mock NextRequest since it doesn't work well in Jest environment
jest.mock('next/server', () => {
  const originalModule = jest.requireActual('next/server');
  return {
    ...originalModule,
    NextRequest: jest.fn(),
    NextResponse: {
      json: jest.fn((body, options) => ({
        status: options?.status || 200,
        body,
      })),
    },
  };
});
import { validateToken } from '@/utils/api-auth';
import { copilotApi } from 'copilot-node-sdk';

// Mock copilotApi
jest.mock('copilot-node-sdk', () => ({
  copilotApi: jest.fn().mockImplementation(() => ({
    retrieveWorkspace: jest.fn().mockResolvedValue({}),
  })),
}));

// Mock NextRequest
const mockRequest = (token?: string) => {
  const url = new URL('https://example.com');
  if (token) {
    url.searchParams.set('token', token);
  }
  
  return {
    url: url.toString(),
    nextUrl: url,
  } as unknown as NextRequest;
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
    const request = mockRequest('valid-token');
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
    const request = mockRequest();
    const { copilot, response } = await validateToken(request);

    // Should return no client and an error response in production
    expect(copilot).toBeNull();
    expect(response).toBeInstanceOf(NextResponse);
    expect(response?.status).toBe(401);
  });

  test('skips validation in local environment', async () => {
    process.env.COPILOT_ENV = 'local';
    const request = mockRequest(); // No token
    const { copilot, response } = await validateToken(request);

    // Should return copilot client and no error response
    expect(copilot).toBeTruthy();
    expect(response).toBeNull();
  });

  test('skips validation in development environment', async () => {
    process.env.NODE_ENV = 'development';
    const request = mockRequest(); // No token
    const { copilot, response } = await validateToken(request);

    // Should return copilot client and no error response
    expect(copilot).toBeTruthy();
    expect(response).toBeNull();
  });
});