import type { SearchParams } from '@/app/search-params';
import { isTestOrCIEnvironment } from '@/utils/environment';

interface TokenGateProps {
  children: React.ReactNode;
  searchParams: SearchParams;
  forceValidation?: boolean; // Optional prop for tests to force validation
}

export function TokenGate({
  children,
  searchParams,
  forceValidation = false,
}: TokenGateProps) {
  // Determine if token validation should be enforced
  const shouldEnforceValidation =
    determineShouldEnforceValidation(forceValidation);

  // If token is missing but required, throw error
  if (!searchParams.token && shouldEnforceValidation) {
    throw new Error(
      'Session Token is required, guide available at: https://docs.copilot.com/docs/custom-apps-setting-up-the-sdk#session-tokens',
    );
  }

  return children;
}

/**
 * Determines if token validation should be enforced based on environment
 * This is extracted to a separate function for better testability
 */
function determineShouldEnforceValidation(forceValidation: boolean): boolean {
  // If forceValidation prop is true, always enforce validation
  if (forceValidation) {
    return true;
  }

  // Client-side environment checks
  if (typeof window !== 'undefined') {
    // SECURITY TEST MODE: If window.SECURITY_TEST_MODE is set, always enforce validation
    if ((window as any).SECURITY_TEST_MODE === true) {
      console.log(
        '[TokenGate] Security test mode active, enforcing token validation',
      );
      return true;
    }

    // REGULAR TEST MODE: If __TEST_MODE__ is set in browser-mocks.ts, skip validation
    if ((window as any).__TEST_MODE__ === true) {
      console.log(
        '[TokenGate] Test mode detected via window.__TEST_MODE__, skipping validation',
      );
      return false;
    }

    // Additional debug info
    console.log('[TokenGate] Token validation environment:', {
      isDevelopment: process.env.NODE_ENV === 'development',
      isTest: process.env.NODE_ENV === 'test',
      CI: process.env.CI === 'true',
      TEST_MODE: process.env.NEXT_PUBLIC_TEST_MODE === 'true',
      windowTestMode: (window as any).__TEST_MODE__,
      securityTestMode: (window as any).SECURITY_TEST_MODE,
    });
  }

  // If not on client or no special flags, use standard environment check
  return !isTestOrCIEnvironment();
}
