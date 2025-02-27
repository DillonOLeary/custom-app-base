import { copilotApi } from 'copilot-node-sdk';

import { TokenGate } from '@/components/TokenGate';
import { ProjectsDashboard } from '@/components/ProjectsDashboard';

/**
 * The revalidate property determine's the cache TTL for this page and
 * all fetches that occur within it. This value is in seconds.
 */
export const revalidate = 180;

async function Content({ searchParams }: { searchParams: SearchParams }) {
  // Setup Copilot API client
  const { token } = searchParams;
  const copilot = copilotApi({
    apiKey: process.env.COPILOT_API_KEY ?? '',
    token: typeof token === 'string' ? token : undefined,
  });
  
  // These API calls are kept for session validation but not directly used
  await copilot.retrieveWorkspace();
  await copilot.getTokenPayload?.();
  
  return (
    <ProjectsDashboard />
  );
}

export default function Home({ searchParams }: { searchParams: SearchParams }) {
  return (
    <TokenGate searchParams={searchParams}>
      <Content searchParams={searchParams} />
    </TokenGate>
  );
}
