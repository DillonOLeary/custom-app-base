import { NextResponse } from 'next/server';

// This prevents this route from being pre-rendered during build time
export const dynamic = 'force-dynamic';

export async function GET() {
  // Return environment variables that are safe to expose (no secrets)
  return NextResponse.json({
    NODE_ENV: process.env.NODE_ENV,
    COPILOT_ENV: process.env.COPILOT_ENV,
    CI: process.env.CI,
    NEXT_PHASE: process.env.NEXT_PHASE,
    VERCEL: process.env.VERCEL,
    VERCEL_ENV: process.env.VERCEL_ENV,
    NEXT_PUBLIC_TEST_MODE: process.env.NEXT_PUBLIC_TEST_MODE,
    // Don't return API keys or other sensitive data
  });
}
