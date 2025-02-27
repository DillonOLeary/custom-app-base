import { NextRequest, NextResponse } from 'next/server';

/**
 * Enhanced security middleware that adds comprehensive security headers
 * to protect against common web vulnerabilities.
 */
export function middleware(request: NextRequest) {
  // Skip middleware in development or Vercel production for easier debugging
  if (process.env.NODE_ENV === 'development' || process.env.VERCEL === '1') {
    return NextResponse.next();
  }

  // Generate a strong random nonce for CSP
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

  // Enhanced Content Security Policy with additional protections but also allowing necessary resources
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' 'nonce-${nonce}' https://*.copilot.com https://*.copilot.app https://*.vercel.app;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https://*.copilot.com https://*.copilot.app;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' wss://*.copilot.com wss://*.copilot.app https://*.copilot.com https://*.copilot.app https://app-api.copilot.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors https://dashboard.copilot.com/ https://*.copilot.app/ https://*.vercel.app;
    frame-src https://*.copilot.com https://*.copilot.app;
    worker-src 'self' blob:;
    manifest-src 'self';
    media-src 'self';
    child-src 'self' blob:;
    block-all-mixed-content;
    upgrade-insecure-requests;
  `;

  // Remove whitespace for proper header formatting
  const contentSecurityPolicyHeaderValue = cspHeader
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Set up request headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set(
    'Content-Security-Policy',
    contentSecurityPolicyHeaderValue,
  );

  // Create response with security headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Set comprehensive security headers
  response.headers.set(
    'Content-Security-Policy',
    contentSecurityPolicyHeaderValue,
  );
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()',
  );
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload',
  );

  // Prevent cacheable responses to contain sensitive information
  if (isApiEndpoint(request.nextUrl.pathname)) {
    response.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate',
    );
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
  }

  return response;
}

/**
 * Helper function to determine if a path is an API endpoint
 */
function isApiEndpoint(path: string): boolean {
  return path.startsWith('/api/') || path.includes('/api/');
}
