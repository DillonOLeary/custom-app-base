import { copilotApi } from 'copilot-node-sdk';
import type { SearchParams } from '../search-params';
import { TokenGate } from '@/components/common/TokenGate';
import { ProjectsDashboard } from '@/components/project-dashboard/ProjectsDashboard';

/**
 * The revalidate property determine's the cache TTL for this page and
 * all fetches that occur within it. This value is in seconds.
 */
export const revalidate = 180;

// Using JSX.Element as return type to fix TypeScript error
async function Content({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<JSX.Element> {
  // Setup Copilot API client
  const { token } = searchParams;
  const copilot = copilotApi({
    apiKey: process.env.COPILOT_API_KEY ?? '',
    token: typeof token === 'string' ? token : undefined,
  });

  // These API calls are kept for session validation but not directly used
  try {
    await copilot.retrieveWorkspace();

    // Only call getTokenPayload if it exists
    if (typeof copilot.getTokenPayload === 'function') {
      await copilot.getTokenPayload();
    }
  } catch (error) {
    // In development mode or tests, we can continue without valid Copilot SDK
    if (
      process.env.NODE_ENV === 'development' ||
      process.env.NODE_ENV === 'test'
    ) {
      console.log('Running in development/test mode without SDK validation');
    } else {
      throw new Error('Unable to authorize Copilot SDK.');
    }
  }

  return <ProjectsDashboard />;
}

export default function Home({ searchParams }: { searchParams: SearchParams }) {
  return (
    <TokenGate searchParams={searchParams}>
      <Content searchParams={searchParams} />
    </TokenGate>
  );
}
