import { validateAndExtractTokenClaims } from '@/utils/token-validation';
import { copilotApi } from 'copilot-node-sdk';

// Mock copilotApi
jest.mock('copilot-node-sdk', () => ({
  copilotApi: jest.fn(),
}));

describe('JWT Token Security', () => {
  let mockGetTokenPayload: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create a mock implementation for getTokenPayload
    mockGetTokenPayload = jest.fn().mockResolvedValue({
      sub: 'user-123',
      exp: Math.floor(Date.now() / 1000) + 3600, // Valid for 1 hour from now
      iat: Math.floor(Date.now() / 1000) - 60, // Issued 1 minute ago
      workspaceId: 'workspace-456',
    });

    // Mock the copilotApi implementation
    (copilotApi as jest.Mock).mockImplementation(() => ({
      getTokenPayload: mockGetTokenPayload,
    }));
  });

  // Helper function to create a basic mock JWT token
  const createMockJwt = (
    header: any,
    payload: any,
    signature = 'fake-signature',
  ) => {
    const base64Header = Buffer.from(JSON.stringify(header)).toString('base64');
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString(
      'base64',
    );
    return `${base64Header}.${base64Payload}.${signature}`;
  };

  test('rejects tokens with invalid format', async () => {
    // Invalid format - not a JWT (no dots)
    const result1 = await validateAndExtractTokenClaims('not-a-jwt-token');
    expect(result1.isValid).toBe(false);
    expect(result1.error).toContain('Invalid');

    // Invalid format - only two parts (missing signature)
    const result2 = await validateAndExtractTokenClaims('header.payload');
    expect(result2.isValid).toBe(false);
    expect(result2.error).toContain('three parts');

    // Invalid format - more than three parts
    const result3 = await validateAndExtractTokenClaims(
      'header.payload.signature.extra',
    );
    expect(result3.isValid).toBe(false);
    expect(result3.error).toContain('three parts');
  });

  test('rejects tokens with insecure algorithms', async () => {
    // Test 'none' algorithm
    const noneAlgToken = createMockJwt({ alg: 'none' }, { sub: 'user-123' });
    const result1 = await validateAndExtractTokenClaims(noneAlgToken);
    expect(result1.isValid).toBe(false);
    expect(result1.error).toContain('insecure algorithm');

    // Test 'HS256' algorithm (considered less secure for certain use cases)
    const hs256Token = createMockJwt({ alg: 'HS256' }, { sub: 'user-123' });
    const result2 = await validateAndExtractTokenClaims(hs256Token);
    expect(result2.isValid).toBe(false);
    expect(result2.error).toContain('insecure algorithm');

    // Test missing algorithm
    const noAlgToken = createMockJwt({ typ: 'JWT' }, { sub: 'user-123' });
    const result3 = await validateAndExtractTokenClaims(noAlgToken);
    expect(result3.isValid).toBe(false);
    expect(result3.error).toContain('missing algorithm');
  });

  test('accepts tokens with secure algorithms', async () => {
    // Test RS256 algorithm
    const rs256Token = createMockJwt(
      { alg: 'RS256', typ: 'JWT' },
      { sub: 'user-123' },
    );
    await validateAndExtractTokenClaims(rs256Token); // Should not throw

    // Verify copilotApi was called with the token
    expect(copilotApi).toHaveBeenCalledWith({
      apiKey: '',
      token: rs256Token,
    });

    // Test ES256 algorithm
    const es256Token = createMockJwt(
      { alg: 'ES256', typ: 'JWT' },
      { sub: 'user-123' },
    );
    await validateAndExtractTokenClaims(es256Token); // Should not throw
  });

  test('validates token expiration and issuance time', async () => {
    const validToken = createMockJwt(
      { alg: 'RS256', typ: 'JWT' },
      {
        sub: 'user-123',
        exp: Math.floor(Date.now() / 1000) + 3600, // Valid for 1 hour
        iat: Math.floor(Date.now() / 1000) - 60, // Issued 1 minute ago
      },
    );

    // Mock the getTokenPayload to return our payload
    mockGetTokenPayload.mockResolvedValueOnce({
      sub: 'user-123',
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000) - 60,
    });

    // Valid token
    const result1 = await validateAndExtractTokenClaims(validToken);
    expect(result1.isValid).toBe(true);

    // Expired token
    mockGetTokenPayload.mockResolvedValueOnce({
      sub: 'user-123',
      exp: Math.floor(Date.now() / 1000) - 60, // Expired 1 minute ago
      iat: Math.floor(Date.now() / 1000) - 3600,
    });

    const result2 = await validateAndExtractTokenClaims(validToken);
    expect(result2.isValid).toBe(false);
    expect(result2.error).toContain('expired');

    // Future-dated token (issued in the future)
    mockGetTokenPayload.mockResolvedValueOnce({
      sub: 'user-123',
      exp: Math.floor(Date.now() / 1000) + 7200,
      iat: Math.floor(Date.now() / 1000) + 60, // Issued 1 minute in the future
    });

    const result3 = await validateAndExtractTokenClaims(validToken);
    expect(result3.isValid).toBe(false);
    expect(result3.error).toContain('used before issued');

    // Too old token
    const oldTime = Math.floor(Date.now() / 1000) - 8 * 24 * 60 * 60; // 8 days ago
    mockGetTokenPayload.mockResolvedValueOnce({
      sub: 'user-123',
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: oldTime,
    });

    const result4 = await validateAndExtractTokenClaims(validToken);
    expect(result4.isValid).toBe(false);
    expect(result4.error).toContain('too old');
  });

  test('validates required claims', async () => {
    const validToken = createMockJwt(
      { alg: 'RS256', typ: 'JWT' },
      { sub: 'user-123', exp: 1234567890, iat: 1234566890 },
    );

    // Missing 'sub' claim
    mockGetTokenPayload.mockResolvedValueOnce({
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000) - 60,
      // No 'sub' claim
    });

    const result1 = await validateAndExtractTokenClaims(validToken);
    expect(result1.isValid).toBe(false);
    expect(result1.error).toContain('Missing required claim: sub');

    // Missing 'exp' claim
    mockGetTokenPayload.mockResolvedValueOnce({
      sub: 'user-123',
      iat: Math.floor(Date.now() / 1000) - 60,
      // No 'exp' claim
    });

    const result2 = await validateAndExtractTokenClaims(validToken);
    expect(result2.isValid).toBe(false);
    expect(result2.error).toContain('Missing required claim: exp');

    // Missing 'iat' claim
    mockGetTokenPayload.mockResolvedValueOnce({
      sub: 'user-123',
      exp: Math.floor(Date.now() / 1000) + 3600,
      // No 'iat' claim
    });

    const result3 = await validateAndExtractTokenClaims(validToken);
    expect(result3.isValid).toBe(false);
    expect(result3.error).toContain('Missing required claim: iat');
  });
});
