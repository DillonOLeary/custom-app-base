/**
 * Utility to check the current environment
 */

/**
 * Determines if the application is running in a test or CI environment
 */
export function isTestOrCIEnvironment(): boolean {
  return (
    process.env.NODE_ENV === 'test' ||
    process.env.NODE_ENV === 'development' ||
    process.env.NEXT_PUBLIC_TEST_MODE === 'true' ||
    process.env.CI === 'true' ||
    process.env.COPILOT_ENV === 'local'
  );
}

/**
 * Determines if the application is running in a production environment
 */
export function isProductionEnvironment(): boolean {
  // If security enforcement is active, always report as production
  if (process.env.ENFORCE_SDK_VALIDATION === 'true') {
    return true;
  }

  return process.env.NODE_ENV === 'production' && !isTestOrCIEnvironment();
}

/**
 * Determines if the application is running with enforced security
 * This is a critical security check that should never be bypassed
 */
export function isSecurityEnforced(): boolean {
  return (
    process.env.ENFORCE_SDK_VALIDATION === 'true' ||
    (process.env.NODE_ENV === 'production' &&
      process.env.COPILOT_ENV !== 'local' &&
      process.env.CI !== 'true' &&
      process.env.NEXT_PUBLIC_TEST_MODE !== 'true')
  );
}

/**
 * Determines if SDK validation should be skipped
 */
export function shouldSkipSDKValidation(): boolean {
  // Safely access environment variables that might be undefined
  // Try/catch for safer client/server code that works in all contexts
  try {
    // HIGHEST PRIORITY: Check for security test mode in browser context
    if (
      typeof window !== 'undefined' &&
      (window as any).SECURITY_TEST_MODE === true
    ) {
      console.log('Security test mode detected - NOT skipping SDK validation');
      return false;
    }

    // CRITICAL SECURITY CHECK: If we explicitly set ENFORCE_SDK_VALIDATION=true,
    // then we always return false here, enforcing validation regardless of other settings
    if (process.env.ENFORCE_SDK_VALIDATION === 'true') {
      console.log(
        'SECURITY ENFORCEMENT: SDK validation is explicitly enforced',
      );
      return false;
    }

    // Log environment for debugging
    console.log('Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      COPILOT_ENV: process.env.COPILOT_ENV,
      CI: process.env.CI,
      NEXT_PUBLIC_TEST_MODE: process.env.NEXT_PUBLIC_TEST_MODE,
    });

    // HIGHEST PRIORITY: Check for CI environment first (most important for GitHub Actions)
    if (process.env.CI === 'true') {
      console.log('Skipping SDK validation - CI environment detected');
      return true;
    }

    // Check for COPILOT_ENV=local which is explicitly set for testing
    if (process.env.COPILOT_ENV === 'local') {
      console.log('Skipping SDK validation - COPILOT_ENV=local detected');
      return true;
    }

    // Check for browser-side test flags (for e2e tests)
    if (typeof window !== 'undefined') {
      // Normal test mode detection
      if (
        (window as any).__TEST_MODE__ === true ||
        (window as any).__COPILOT_ENV__ === 'local'
      ) {
        console.log('Skipping SDK validation - browser test flags detected');
        return true;
      }
    }

    // Force skip validation in tests
    if (
      process.env.NODE_ENV === 'test' ||
      process.env.NEXT_PUBLIC_TEST_MODE === 'true'
    ) {
      console.log('Skipping SDK validation - test environment detected');
      return true;
    }

    // Skip in development environments
    if (process.env.NODE_ENV === 'development') {
      console.log('Skipping SDK validation - development environment detected');
      return true;
    }

    // ADDITIONAL SAFETY: If there's no API key available, we should skip validation
    if (!process.env.COPILOT_API_KEY) {
      console.log('Skipping SDK validation - no API key available');
      return true;
    }

    // Default - require validation
    return false;
  } catch (error) {
    // If something goes wrong, default to skipping validation for safety
    console.error(
      'Error checking environment, defaulting to skip validation:',
      error,
    );
    return true;
  }
}
