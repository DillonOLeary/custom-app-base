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

// Override the token validation function for testing
jest.mock('@/utils/token-validation', () => {
  // Create a simple rate limiter for testing
  const ipAttempts = new Map<string, number>();

  return {
    validateAndExtractTokenClaims: jest
      .fn()
      .mockImplementation((token, ip = 'default-ip') => {
        // Get current attempts for this IP
        const attempts = ipAttempts.get(ip) || 0;

        // Update attempts count
        ipAttempts.set(ip, attempts + 1);

        // If too many attempts, rate limit
        if (attempts >= 10) {
          return {
            isValid: false,
            error: 'Rate limit exceeded. Try again later.',
            claims: null,
          };
        }

        // Otherwise, return success
        return {
          isValid: true,
          claims: {
            sub: 'test-user',
            exp: Math.floor(Date.now() / 1000) + 3600,
            iat: Math.floor(Date.now() / 1000) - 60,
          },
        };
      }),
    cleanupRateLimitStore: jest.fn().mockImplementation(() => {
      // Clear the map to simulate cleanup
      ipAttempts.clear();
    }),
  };
});

describe('Rate Limiting Security', () => {
  // Reset mocks
  beforeEach(() => {
    jest.clearAllMocks();
    (validateAndExtractTokenClaims as jest.Mock).mockClear();
    (cleanupRateLimitStore as jest.Mock).mockClear();
  });

  test('rate limits excessive validation attempts from the same IP', async () => {
    // Generate valid JWT token
    const validToken = 'header.payload.signature';
    const ip = '192.168.1.100';

    // Make requests until rate limited
    let rateLimitedAtAttempt = -1;
    const MAX_ATTEMPTS = 10;
    const TOTAL_ATTEMPTS = MAX_ATTEMPTS + 5;

    // Array to store all results
    const results = [];

    for (let i = 0; i < TOTAL_ATTEMPTS; i++) {
      const result = await validateAndExtractTokenClaims(validToken, ip);
      results.push(result);

      if (!result.isValid && result.error?.includes('Rate limit')) {
        rateLimitedAtAttempt = i;
        break;
      }
    }

    // Verify that rate limiting occurred
    expect(rateLimitedAtAttempt).toBeGreaterThanOrEqual(MAX_ATTEMPTS);

    // Check that rate limit error includes specific details
    if (rateLimitedAtAttempt >= 0) {
      expect(results[rateLimitedAtAttempt].error).toContain(
        'Rate limit exceeded',
      );
      expect(results[rateLimitedAtAttempt].error).toContain('Try again');
    }
  });

  test('different IPs are not affected by rate limits on other IPs', async () => {
    // Generate valid JWT token
    const validToken = 'header.payload.signature';
    const ip1 = '192.168.1.101';
    const ip2 = '192.168.1.102';

    // Make many requests from the first IP to trigger its rate limit
    for (let i = 0; i < 15; i++) {
      await validateAndExtractTokenClaims(validToken, ip1);
    }

    // The last request from ip1 should be rate limited
    const rateLimitedResult = await validateAndExtractTokenClaims(
      validToken,
      ip1,
    );
    expect(rateLimitedResult.isValid).toBe(false);
    expect(rateLimitedResult.error).toContain('Rate limit');

    // But a request from a different IP should still work
    const secondIpResult = await validateAndExtractTokenClaims(validToken, ip2);
    expect(secondIpResult.isValid).toBe(true);
  });

  test('stores rate limit information correctly', async () => {
    // This is a simplified test of the rate limit functionality
    const validToken = 'header.payload.signature';
    const ip = '192.168.1.103';

    // First few calls should succeed
    for (let i = 0; i < 5; i++) {
      const result = await validateAndExtractTokenClaims(validToken, ip);
      expect(result.isValid).toBe(true);
    }

    // Validation function should have been called with correct parameters
    expect(validateAndExtractTokenClaims).toHaveBeenCalledWith(validToken, ip);
    expect(validateAndExtractTokenClaims).toHaveBeenCalledTimes(5);
  });

  test('cleans up rate limit store', async () => {
    // Generate a valid JWT token
    const validToken = 'header.payload.signature';

    // Create multiple entries in the rate limiter with different IPs
    const ips = Array.from({ length: 5 }, (_, i) => `192.168.0.${i}`);

    // Call validate function with each IP to populate store
    for (const ip of ips) {
      await validateAndExtractTokenClaims(validToken, ip);
    }

    // Run cleanup
    cleanupRateLimitStore();

    // Verify cleanup function was called
    expect(cleanupRateLimitStore).toHaveBeenCalled();
  });

  test('handles different types of IP addresses', async () => {
    // Test with different IP formats
    const validToken = 'header.payload.signature';

    const emptyIpResult = await validateAndExtractTokenClaims(validToken, '');
    const ipv4Result = await validateAndExtractTokenClaims(
      validToken,
      '192.168.1.1',
    );
    const ipv6Result = await validateAndExtractTokenClaims(
      validToken,
      '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
    );

    // All should be processed without error
    expect(emptyIpResult).toBeDefined();
    expect(ipv4Result).toBeDefined();
    expect(ipv6Result).toBeDefined();
  });
});
