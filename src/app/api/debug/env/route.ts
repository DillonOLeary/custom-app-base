import { NextResponse } from 'next/server';
import {
  shouldSkipSDKValidation,
  isTestOrCIEnvironment,
  isProductionEnvironment,
} from '@/utils/environment';

// This prevents this route from being pre-rendered during build time
export const dynamic = 'force-dynamic';

export async function GET() {
  // Return environment status with function evaluations
  return NextResponse.json({
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      COPILOT_ENV: process.env.COPILOT_ENV,
      CI: process.env.CI,
      NEXT_PUBLIC_TEST_MODE: process.env.NEXT_PUBLIC_TEST_MODE,
    },
    evaluations: {
      shouldSkipSDKValidation: shouldSkipSDKValidation(),
      isTestOrCIEnvironment: isTestOrCIEnvironment(),
      isProductionEnvironment: isProductionEnvironment(),
    },
    timestamp: new Date().toISOString(),
  });
}
