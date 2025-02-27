import { copilotApi } from 'copilot-node-sdk';

interface TokenClaims {
  exp: number; // Expiration time (seconds since epoch)
  iat: number; // Issued at time (seconds since epoch)
  sub: string; // Subject (user identifier)
  workspaceId: string;
  [key: string]: any; // Allow other claims
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
  claims?: TokenClaims;
}

// Store for rate limiting
interface RateLimitStore {
  [ip: string]: {
    count: number;
    resetAt: number;
  };
}
const rateLimitStore: RateLimitStore = {};

// Security-related constants
const MAX_ATTEMPTS = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_STORE_SIZE = 10000; // Maximum number of IPs to track
const STORE_CLEANUP_INTERVAL = 10 * 60 * 1000; // Clean up every 10 minutes

/**
 * Validates a token and extracts its claims
 * This adds security to the token validation process by:
 * 1. Checking token expiration
 * 2. Validating required claims
 * 3. Rate limiting validation attempts
 * 4. Verifying token algorithm
 * 5. Validating token structure
 *
 * @param token The token to validate
 * @param clientIp Optional client IP for rate limiting
 * @returns Validation result with claims if valid
 */
export async function validateAndExtractTokenClaims(
  token: string,
  clientIp?: string,
): Promise<ValidationResult> {
  // Apply rate limiting if client IP is provided
  if (clientIp) {
    const isRateLimited = checkRateLimit(clientIp);
    if (isRateLimited) {
      return {
        isValid: false,
        error: `Rate limit exceeded for token validation. Try again later.`,
      };
    }
  }

  try {
    // Basic token format validation
    if (!token || typeof token !== 'string' || token.length < 10) {
      return {
        isValid: false,
        error: 'Invalid token format or empty token',
      };
    }

    // Verify JWT structure (header.payload.signature)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return {
        isValid: false,
        error: 'Invalid JWT format: token must have three parts',
      };
    }

    // Verify header contains algorithm information
    try {
      const headerJson = Buffer.from(parts[0], 'base64').toString();
      const header = JSON.parse(headerJson);

      // Ensure algorithm is specified and is a secure algorithm
      if (!header.alg) {
        return {
          isValid: false,
          error: 'Invalid JWT: missing algorithm',
        };
      }

      // Only allow secure algorithms (RS256, ES256, etc.)
      const secureAlgorithms = [
        'RS256',
        'RS384',
        'RS512',
        'ES256',
        'ES384',
        'ES512',
      ];
      if (!secureAlgorithms.includes(header.alg)) {
        return {
          isValid: false,
          error: `Invalid JWT: insecure algorithm ${header.alg}`,
        };
      }
    } catch (e) {
      return {
        isValid: false,
        error: 'Invalid JWT: header could not be parsed',
      };
    }

    // Create Copilot API client with token
    const copilot = copilotApi({
      apiKey: process.env.COPILOT_API_KEY || '',
      token,
    });

    // Attempt to get token payload (this validates the token with Copilot)
    const tokenPayload = await copilot.getTokenPayload?.();

    if (!tokenPayload) {
      return {
        isValid: false,
        error: 'Invalid token or token payload is missing',
      };
    }

    // Check for required claims
    const requiredClaims = ['exp', 'sub', 'iat'];
    for (const claim of requiredClaims) {
      if (!(claim in tokenPayload)) {
        return {
          isValid: false,
          error: `Missing required claim: ${claim}`,
        };
      }
    }

    // Type assertion to ensure we have the expected claims
    const claims = tokenPayload as TokenClaims;

    // Check token expiration
    const now = Math.floor(Date.now() / 1000);
    if (claims.exp <= now) {
      return {
        isValid: false,
        error: 'Token has expired',
        claims,
      };
    }

    // Check for token used before issued (clock skew attack)
    if (claims.iat > now) {
      return {
        isValid: false,
        error: 'Token used before issued time',
        claims,
      };
    }

    // Check token age (don't accept extremely old tokens)
    const MAX_TOKEN_AGE = 7 * 24 * 60 * 60; // 7 days in seconds
    if (now - claims.iat > MAX_TOKEN_AGE) {
      return {
        isValid: false,
        error: 'Token is too old',
        claims,
      };
    }

    // All validations passed
    return {
      isValid: true,
      claims,
    };
  } catch (error) {
    console.error('Token validation error:', error);
    return {
      isValid: false,
      error: `Token validation failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Check if a client IP has exceeded rate limits
 * @param clientIp The client IP address
 * @returns true if rate limited, false otherwise
 */
function checkRateLimit(clientIp: string): boolean {
  const now = Date.now();

  // Initialize or reset expired entry
  if (!rateLimitStore[clientIp] || rateLimitStore[clientIp].resetAt < now) {
    rateLimitStore[clientIp] = {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    };
    return false;
  }

  // Increment count and check against limit
  rateLimitStore[clientIp].count++;
  return rateLimitStore[clientIp].count > MAX_ATTEMPTS;
}

/**
 * Clear expired rate limit entries and enforce memory limits
 * This prevents potential DoS attacks that could fill memory by
 * generating many unique IP addresses
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();

  // First, remove expired entries
  Object.keys(rateLimitStore).forEach((ip) => {
    if (rateLimitStore[ip].resetAt < now) {
      delete rateLimitStore[ip];
    }
  });

  // If store is still too large, enforce size limit
  const currentSize = Object.keys(rateLimitStore).length;
  if (currentSize > MAX_STORE_SIZE) {
    console.warn(
      `Rate limit store exceeded maximum size (${currentSize}/${MAX_STORE_SIZE}), cleaning up oldest entries`,
    );

    // Get all entries, sorted by reset time (oldest first)
    const entries = Object.entries(rateLimitStore).sort(
      (a, b) => a[1].resetAt - b[1].resetAt,
    );

    // Remove oldest entries until we're under the limit
    const entriesToRemove = currentSize - MAX_STORE_SIZE;
    entries.slice(0, entriesToRemove).forEach(([ip]) => {
      delete rateLimitStore[ip];
    });
  }
}

// Set up periodic cleanup to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitStore, STORE_CLEANUP_INTERVAL);
}
