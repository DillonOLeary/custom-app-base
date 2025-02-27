import { NextResponse } from 'next/server';
import { validateToken } from '@/utils/api-auth';
import { validateAndExtractTokenClaims } from '@/utils/token-validation';
import { copilotApi } from 'copilot-node-sdk';

// Mock copilotApi
// Create a valid JWT token structure for testing
const createMockJwt = (header = { alg: 'RS256', typ: 'JWT' }, payload = {}) => {
  const base64Header = Buffer.from(JSON.stringify(header)).toString('base64');
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
  return `${base64Header}.${base64Payload}.signature`;
};

// Valid token structure with proper claims
const validToken = createMockJwt(
  { alg: 'RS256', typ: 'JWT' },
  {
    exp: Math.floor(Date.now() / 1000) + 3600, // Valid for 1 hour
    iat: Math.floor(Date.now() / 1000) - 60, // Issued 1 minute ago
    sub: 'user-123',
    workspaceId: 'workspace-456',
  },
);

// Mock copilotApi for testing
jest.mock('copilot-node-sdk', () => ({
  copilotApi: jest.fn().mockImplementation(() => ({
    retrieveWorkspace: jest.fn().mockResolvedValue({}),
    getTokenPayload: jest.fn().mockImplementation(() => {
      // This simulates token payload for testing
      return Promise.resolve({
        exp: Math.floor(Date.now() / 1000) + 3600, // Valid for 1 hour from now
        iat: Math.floor(Date.now() / 1000) - 60, // Issued 1 minute ago
        sub: 'user-123',
        userId: 'user-123',
        workspaceId: 'workspace-456',
      });
    }),
  })),
}));

// Create a mock request
const createMockRequest = (token?: string) => {
  const url = new URL('https://example.com');
  if (token) {
    url.searchParams.set('token', token);
  }

  return {
    url: url.toString(),
    nextUrl: {
      searchParams: {
        get: (key: string) => url.searchParams.get(key),
      },
    },
  };
};

describe('Token Security', () => {
  const originalEnv = process.env;
  const originalDate = global.Date;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.COPILOT_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    process.env = originalEnv;
    global.Date = originalDate;
  });

  test('token expiration is properly validated', async () => {
    // Valid token case
    const validRequest = createMockRequest(validToken);
    const result = await validateAndExtractTokenClaims(validToken);

    expect(result.isValid).toBe(true);
    expect(result.claims).toBeTruthy();
    expect(result.claims?.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));

    // Avoid recursive Date.now() by using a fixed timestamp
    // Current time + 2 hours (past the expiration)
    const futureTimestamp = new Date().getTime() + 2 * 60 * 60 * 1000;

    // Create a token that's already expired
    const expiredToken = createMockJwt(
      { alg: 'RS256', typ: 'JWT' },
      {
        sub: 'user-123',
        exp: Math.floor(Date.now() / 1000) - 60, // Expired 1 minute ago
        iat: Math.floor(Date.now() / 1000) - 3600, // Issued 1 hour ago
        workspaceId: 'workspace-456',
      },
    );

    // Mock getTokenPayload to return expired claims
    const mockGetPayloadExpired = jest.fn().mockResolvedValue({
      sub: 'user-123',
      exp: Math.floor(Date.now() / 1000) - 60, // Expired 1 minute ago
      iat: Math.floor(Date.now() / 1000) - 3600, // Issued 1 hour ago
      workspaceId: 'workspace-456',
    });

    // Re-mock copilotApi for the expired token test
    (copilotApi as jest.Mock).mockImplementationOnce(() => ({
      getTokenPayload: mockGetPayloadExpired,
    }));

    const expiredResult = await validateAndExtractTokenClaims(expiredToken);
    expect(expiredResult.isValid).toBe(false);
    expect(expiredResult.error).toContain('expired');
  });

  test('validates token integrity and structure', async () => {
    // Invalid token format
    const result = await validateAndExtractTokenClaims('malformed-token');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Invalid');

    // Missing required claims
    const mockGetPayload = jest.fn().mockResolvedValue({
      // Missing required claims like 'exp', 'sub'
      iat: Math.floor(Date.now() / 1000) - 60,
    });

    // Re-mock copilotApi for this specific test case
    (copilotApi as jest.Mock).mockImplementationOnce(() => ({
      getTokenPayload: mockGetPayload,
    }));

    // Create a token with valid format but missing claims
    const incompleteToken = createMockJwt(
      { alg: 'RS256', typ: 'JWT' },
      { iat: Math.floor(Date.now() / 1000) - 60 },
    );

    const missingClaimsResult =
      await validateAndExtractTokenClaims(incompleteToken);
    expect(missingClaimsResult.isValid).toBe(false);
    expect(missingClaimsResult.error).toContain('Missing required claim');
  });

  test('rate limits token validation attempts', async () => {
    // Simulate multiple validation attempts from the same IP
    const maxAttempts = 10;
    const failures = [];
    const ip = '192.168.1.1';

    // Make multiple requests from the same IP in a short time
    for (let i = 0; i < maxAttempts + 5; i++) {
      const result = await validateAndExtractTokenClaims('test-token', ip);
      if (!result.isValid && result.error?.includes('Rate limit')) {
        failures.push(result);
      }
    }

    // After max attempts, should start seeing rate limit errors
    expect(failures.length).toBeGreaterThan(0);
    expect(failures[0].error).toContain('Rate limit exceeded');
  });
});
