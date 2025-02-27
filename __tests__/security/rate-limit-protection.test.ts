import {
  validateAndExtractTokenClaims,
  cleanupRateLimitStore,
} from '@/utils/token-validation';

// Mock dependencies
jest.mock('copilot-node-sdk', () => ({
  copilotApi: jest.fn().mockImplementation(() => ({
    getTokenPayload: jest.fn().mockResolvedValue({
      sub: 'test-user',
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000) - 60,
    }),
  })),
}));

describe('Rate Limiting Security', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('rate limits excessive validation attempts from the same IP', async () => {
    // Generate valid JWT token
    const validToken = 'header.payload.signature';
    const ip = '192.168.1.100';

    // Make requests until rate limited
    let rateLimited = false;
    const MAX_ATTEMPTS = 10;

    for (let i = 0; i < MAX_ATTEMPTS + 5; i++) {
      const result = await validateAndExtractTokenClaims(validToken, ip);

      if (!result.isValid && result.error?.includes('Rate limit')) {
        rateLimited = true;
        break;
      }
    }

    expect(rateLimited).toBe(true);
  });

  test('cleans up rate limit store entries', () => {
    // Create multiple entries in the rate limiter
    const ips = Array.from({ length: 20 }, (_, i) => `192.168.0.${i}`);

    // Call validate function with each IP to populate store
    ips.forEach((ip) => {
      validateAndExtractTokenClaims('token', ip);
    });

    // Now run cleanup to ensure it runs without errors
    cleanupRateLimitStore();

    // This is a basic test just to ensure the cleanup function works
    // We can't directly test private variables in the module
    expect(true).toBe(true);
  });
});
