import { NextRequest, NextResponse } from 'next/server';
import { copilotApi } from 'copilot-node-sdk';

/**
 * Validates the Copilot token from the request and returns the Copilot API client.
 * If the token is missing and not in local environment, it returns a 401 response.
 *
 * @param request The NextRequest object or any object with url/nextUrl property
 * @returns An object with the Copilot client and a response (if authentication failed)
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
    return { copilot, response: null };
  }

  // Extract token from URL or searchParams
  let token: string | null = null;

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
      response: NextResponse.json(
        {
          error: 'Session token is required',
          message: 'This endpoint requires a valid Copilot session token',
        },
        { status: 401 },
      ),
    };
  }

  try {
    const copilot = copilotApi({
      apiKey: process.env.COPILOT_API_KEY || '',
      token,
    });

    // Validate the token by making a simple API call
    await copilot.retrieveWorkspace();

    return { copilot, response: null };
  } catch (error) {
    console.error('Token validation error:', error);
    return {
      copilot: null,
      response: NextResponse.json(
        {
          error: 'Invalid token',
          message: 'The provided session token is invalid or expired',
        },
        { status: 401 },
      ),
    };
  }
}
