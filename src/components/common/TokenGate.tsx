import type { SearchParams } from '@/app/search-params';
import { isTestOrCIEnvironment } from '@/utils/environment';

export function TokenGate({
  children,
  searchParams,
}: {
  children: React.ReactNode;
  searchParams: SearchParams;
}) {
  // Check for security test mode, which should enforce token validation
  const isSecurityTest =
    typeof window !== 'undefined' &&
    (window as any).SECURITY_TEST_MODE === true;

  // Only skip validation if we're in test/CI AND not in security test mode
  const shouldSkipValidation = isTestOrCIEnvironment() && !isSecurityTest;

  // Log the validation decision for debugging
  if (typeof window !== 'undefined') {
    console.log('[TokenGate] Token validation check:', {
      hasToken: !!searchParams.token,
      isSecurityTest,
      shouldSkipValidation,
    });
  }

  if (!searchParams.token && !shouldSkipValidation) {
    // In security test mode or production, throw error if token is missing
    throw new Error(
      'Session Token is required, guide available at: https://docs.copilot.com/docs/custom-apps-setting-up-the-sdk#session-tokens',
    );
  }

  return children;
}
