import { NextResponse } from 'next/server';
import { validateToken } from '@/utils/api-auth';
import { validateAndExtractTokenClaims } from '@/utils/token-validation';
import { copilotApi } from 'copilot-node-sdk';

// Mock copilotApi
jest.mock('copilot-node-sdk', () => ({
  copilotApi: jest.fn().mockImplementation(() => ({
    retrieveWorkspace: jest.fn().mockResolvedValue({}),
    getTokenPayload: jest.fn().mockImplementation(() => {
      // This simulates token payload for testing
      return Promise.resolve({
        exp: Math.floor(Date.now() / 1000) + 3600, // Valid for 1 hour from now
        iat: Math.floor(Date.now() / 1000) - 60,   // Issued 1 minute ago
        sub: 'user-123',
        userId: 'user-123',
        workspaceId: 'workspace-456'
      });
    })
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
        get: (key: string) => url.searchParams.get(key)
      }
    }
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
    const validRequest = createMockRequest('valid-token');
    const result = await validateAndExtractTokenClaims('valid-token');
    
    expect(result.isValid).toBe(true);
    expect(result.claims).toBeTruthy();
    expect(result.claims?.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
    
    // Expired token case - mock Date.now to return a future time
    const mockDateNow = jest.spyOn(Date, 'now').mockImplementation(() => 
      // Return a time that's after the token expiration (1 hour + 5 minutes in the future)
      Date.now() + (3600 + 300) * 1000
    );
    
    const expiredResult = await validateAndExtractTokenClaims('valid-token');
    expect(expiredResult.isValid).toBe(false);
    expect(expiredResult.error).toBe('Token has expired');
    
    mockDateNow.mockRestore();
  });

  test('validates token integrity and structure', async () => {
    // Invalid token format
    const result = await validateAndExtractTokenClaims('malformed-token');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Invalid token format');
    
    // Missing required claims
    jest.spyOn(copilotApi().getTokenPayload!, 'mockImplementationOnce')
      .mockResolvedValueOnce({
        // Missing required claims like 'exp', 'sub'
        iat: Math.floor(Date.now() / 1000) - 60
      });
    
    const missingClaimsResult = await validateAndExtractTokenClaims('incomplete-token');
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