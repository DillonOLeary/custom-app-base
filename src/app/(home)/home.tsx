import type { SearchParams } from '../search-params';
import { TokenGate } from '@/components/common/TokenGate';
import { ProjectsDashboard } from '@/components/project-dashboard/ProjectsDashboard';
import { validateCopilotToken } from '@/utils/copilot-sdk';
import { shouldSkipSDKValidation } from '@/utils/environment';

/**
 * The revalidate property determine's the cache TTL for this page and
 * all fetches that occur within it. This value is in seconds.
 */
export const revalidate = 180;

// In Next.js App Router, async server components are supported natively
export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // Log environment information for debugging
  console.log('Home page environment:', {
    NODE_ENV: process.env.NODE_ENV,
    COPILOT_ENV: process.env.COPILOT_ENV,
    NEXT_PUBLIC_TEST_MODE: process.env.NEXT_PUBLIC_TEST_MODE,
    shouldSkipSDKValidation: shouldSkipSDKValidation(),
  });

  // Validate Copilot token, with proper handling for test/CI environments
  const { token } = searchParams;
  const { isValid, error } = await validateCopilotToken(
    typeof token === 'string' ? token : undefined,
  );

  // Only throw in production environments
  if (!isValid && !shouldSkipSDKValidation()) {
    throw new Error(`Unable to authorize Copilot SDK: ${error}`);
  }

  // Return the components directly from the server component
  return (
    <TokenGate searchParams={searchParams}>
      <ProjectsDashboard />
    </TokenGate>
  );
}
