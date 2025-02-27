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
  console.log('Environment check:', {
    NODE_ENV: process.env.NODE_ENV,
    COPILOT_ENV: process.env.COPILOT_ENV,
    CI: process.env.CI,
  });

  return (
    process.env.NODE_ENV === 'development' ||
    process.env.NODE_ENV === 'test' ||
    process.env.COPILOT_ENV === 'local' ||
    process.env.CI === 'true' ||
    process.env.NEXT_PUBLIC_TEST_MODE === 'true'
  );
}
