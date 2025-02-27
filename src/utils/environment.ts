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
    process.env.CI === 'true'
  );
}

/**
 * Determines if the application is running in a production environment
 */
export function isProductionEnvironment(): boolean {
  return process.env.NODE_ENV === 'production' && !isTestOrCIEnvironment();
}
