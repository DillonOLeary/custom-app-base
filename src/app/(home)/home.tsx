import { copilotApi } from 'copilot-node-sdk';

import { TokenGate } from '@/components/TokenGate';
import { Container } from '@/components/Container';
import { ProjectsDashboard } from '@/components/ProjectsDashboard';

/**
 * The revalidate property determine's the cache TTL for this page and
 * all fetches that occur within it. This value is in seconds.
 */
export const revalidate = 180;

async function Content({ searchParams }: { searchParams: SearchParams }) {
  const { token } = searchParams;
  const copilot = copilotApi({
    apiKey: process.env.COPILOT_API_KEY ?? '',
    token: typeof token === 'string' ? token : undefined,
  });
  const workspace = await copilot.retrieveWorkspace();
  const session = await copilot.getTokenPayload?.();
  
  return (
    <Container>
      <div className="py-8">
        <div className="flex flex-col items-center mb-8">
          <h1 className="heading-primary heading-1 text-[--color-text-dark] mb-2">RENEWABLE ENERGY PROJECT SCANNER</h1>
          <div className="w-16 h-1 bg-[--color-primary] rounded mb-4"></div>
          <p className="heading-secondary text-1 text-center text-[--color-text-dark] max-w-2xl">
            Upload and analyze your renewable energy project data rooms to get your <span className="important-text text-[--color-primary] font-bold">CEARTscore</span>.
          </p>
        </div>
        
        <ProjectsDashboard />
      </div>
    </Container>
  );
}

export default function Home({ searchParams }: { searchParams: SearchParams }) {
  return (
    <TokenGate searchParams={searchParams}>
      <Content searchParams={searchParams} />
    </TokenGate>
  );
}
