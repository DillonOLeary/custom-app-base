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
  return process.env.NODE_ENV === 'production' && !isTestOrCIEnvironment();
}

/**
 * Determines if SDK validation should be skipped
 */
export function shouldSkipSDKValidation(): boolean {
  // Safely access environment variables that might be undefined
  // Try/catch for safer client/server code that works in all contexts
  try {
    // Check for browser-side test flags (for e2e tests)
    if (typeof window !== 'undefined') {
      if (
        (window as any).__TEST_MODE__ === true ||
        (window as any).__COPILOT_ENV__ === 'local'
      ) {
        console.log('Skipping SDK validation - browser test flags detected');
        return true;
      }
    }

    console.log('Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      COPILOT_ENV: process.env.COPILOT_ENV,
      CI: process.env.CI,
      NEXT_PUBLIC_TEST_MODE: process.env.NEXT_PUBLIC_TEST_MODE,
    });

    // Force skip validation in tests
    if (
      process.env.NODE_ENV === 'test' ||
      process.env.NEXT_PUBLIC_TEST_MODE === 'true'
    ) {
      console.log('Skipping SDK validation - test environment detected');
      return true;
    }

    // Always skip validation in local development
    if (process.env.COPILOT_ENV === 'local') {
      console.log('Skipping SDK validation - COPILOT_ENV=local detected');
      return true;
    }

    // Skip in development environments
    if (process.env.NODE_ENV === 'development') {
      console.log('Skipping SDK validation - development environment detected');
      return true;
    }

    // Skip in CI environments
    if (process.env.CI === 'true') {
      console.log('Skipping SDK validation - CI environment detected');
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
