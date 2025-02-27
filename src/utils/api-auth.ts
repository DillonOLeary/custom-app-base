import { NextRequest, NextResponse } from 'next/server';
import { copilotApi } from 'copilot-node-sdk';
import { validateAndExtractTokenClaims } from './token-validation';

/**
 * Validates the Copilot token from the request and returns the Copilot API client.
 * If the token is missing and not in local environment, it returns a 401 response.
 * Includes enhanced token validation with expiration checking and rate limiting.
 *
 * @param request The NextRequest object or any object with url/nextUrl property
 * @returns An object with the Copilot client, token claims, and response (if authentication failed)
 */
export async function validateToken(
  request:
    | NextRequest
    | {
        url: string;
        nextUrl?: { searchParams: { get: (key: string) => string | null } };
      },
) {
  // Skip token validation in development/local environment
  if (
    process.env.COPILOT_ENV === 'local' ||
    process.env.NODE_ENV === 'development'
  ) {
    const copilot = copilotApi({
      apiKey: process.env.COPILOT_API_KEY || '',
    });
    return { copilot, response: null, claims: null };
  }

  // Extract token from URL or searchParams
  let token: string | null = null;

  // Get client IP for rate limiting (if available)
  let clientIp: string | undefined;
  if ('headers' in request && typeof request.headers?.get === 'function') {
    // Try to get IP from X-Forwarded-For or remote address
    clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      (request as any).socket?.remoteAddress;
  }

  if ('nextUrl' in request && request.nextUrl?.searchParams?.get) {
    // Handle NextRequest objects
    token = request.nextUrl.searchParams.get('token');
  } else {
    // Handle plain objects with URL string
    try {
      const url = new URL(request.url);
      token = url.searchParams.get('token');
    } catch (e) {
      console.error('Error parsing URL:', e);
    }
  }

  if (!token) {
    return {
      copilot: null,
      claims: null,
      response: NextResponse.json(
        {
          error: 'Session token is required',
          message: 'This endpoint requires a valid Copilot session token',
        },
        { status: 401 },
      ),
    };
  }

  // Enhanced token validation with security checks
  const validationResult = await validateAndExtractTokenClaims(token, clientIp);

  if (!validationResult.isValid) {
    const statusCode = validationResult.error?.includes('Rate limit')
      ? 429
      : 401;
    const message = validationResult.error?.includes('Rate limit')
      ? 'Too many authentication attempts. Please try again later.'
      : 'The provided session token is invalid or expired';

    return {
      copilot: null,
      claims: null,
      response: NextResponse.json(
        {
          error: validationResult.error || 'Invalid token',
          message,
        },
        { status: statusCode },
      ),
    };
  }

  // Token is valid, create Copilot client
  try {
    const copilot = copilotApi({
      apiKey: process.env.COPILOT_API_KEY || '',
      token,
    });

    return {
      copilot,
      claims: validationResult.claims || null,
      response: null,
    };
  } catch (error) {
    console.error('API client creation error:', error);
    return {
      copilot: null,
      claims: null,
      response: NextResponse.json(
        {
          error: 'Service error',
          message: 'Could not initialize API client',
        },
        { status: 500 },
      ),
    };
  }
}
