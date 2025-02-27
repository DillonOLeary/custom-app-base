import { validateAndExtractTokenClaims, cleanupRateLimitStore } from '@/utils/token-validation';

// Mock dependencies
jest.mock('copilot-node-sdk', () => ({
  copilotApi: jest.fn().mockImplementation(() => ({
    getTokenPayload: jest.fn().mockResolvedValue({
      sub: 'test-user',
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000) - 60,
    })
  }))
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
  
  test('prevents memory DoS by cleaning up rate limit store', () => {
    // Create spy on console.warn
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    // Mock private rateLimitStore variable with a large number of entries
    // We'll do this by calling the function with many different IPs
    const generateIps = (count: number) => {
      return Array.from({ length: count }, (_, i) => `192.168.1.${i % 255}`);
    };
    
    // Get many IPs (more than MAX_STORE_SIZE which is 10000)
    const ips = generateIps(15000);
    
    // Call validate function with each IP to populate store
    ips.forEach(ip => {
      validateAndExtractTokenClaims('token', ip);
    });
    
    // Now run cleanup
    cleanupRateLimitStore();
    
    // Check that warning was logged about store size
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('exceeded maximum size'));
    
    consoleSpy.mockRestore();
  });
});