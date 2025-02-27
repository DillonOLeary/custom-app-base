import { copilotApi } from 'copilot-node-sdk';
import type { SearchParams } from '../search-params';
import { TokenGate } from '@/components/common/TokenGate';
import { ProjectsDashboard } from '@/components/project-dashboard/ProjectsDashboard';

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
  // Setup Copilot API client (server-side)
  const { token } = searchParams;
  const copilot = copilotApi({
    apiKey: process.env.COPILOT_API_KEY ?? '',
    token: typeof token === 'string' ? token : undefined,
  });

  // Validate session server-side
  try {
    await copilot.retrieveWorkspace();
    if (typeof copilot.getTokenPayload === 'function') {
      await copilot.getTokenPayload();
    }
  } catch (error) {
    if (
      process.env.NODE_ENV === 'development' ||
      process.env.NODE_ENV === 'test'
    ) {
      console.log('Running in development/test mode without SDK validation');
    } else {
      throw new Error('Unable to authorize Copilot SDK.');
    }
  }

  // Return the components directly from the server component
  return (
    <TokenGate searchParams={searchParams}>
      <ProjectsDashboard />
    </TokenGate>
  );
}
