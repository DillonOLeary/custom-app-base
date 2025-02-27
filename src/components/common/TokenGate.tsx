import type { SearchParams } from '@/app/search-params';
import { isTestOrCIEnvironment } from '@/utils/environment';

export function TokenGate({
  children,
  searchParams,
}: {
  children: React.ReactNode;
  searchParams: SearchParams;
}) {
  // Token is required in all environments unless in development, test mode, or CI
  const isTestOrCI = isTestOrCIEnvironment();

  if (!searchParams.token && !isTestOrCI) {
    throw new Error(
      'Session Token is required, guide available at: https://docs.copilot.com/docs/custom-apps-setting-up-the-sdk#session-tokens',
    );
  }

  return children;
}
