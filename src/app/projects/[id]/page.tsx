import { Metadata } from 'next';
import { Project } from '@/types/project';
import { ProjectDetail } from '@/components/project-detail/ProjectDetail';
import { Container } from '@/components/common/Container';
import { TokenGate } from '@/components/common/TokenGate';
import { copilotApi } from 'copilot-node-sdk';
import type { SearchParams } from '@/app/search-params';

export const metadata: Metadata = {
  title: 'Project Details | CEART',
  description: 'Renewable Energy Project Details and Analysis',
};

type ProjectPageProps = {
  params: { id: string };
  searchParams: SearchParams;
};

async function Content({
  projectId,
  token,
}: {
  projectId: string;
  token?: string;
}) {
  // Setup Copilot API client
  const copilot = copilotApi({
    apiKey: process.env.COPILOT_API_KEY ?? '',
    token: typeof token === 'string' ? token : undefined,
  });

  // These API calls are kept for session validation
  await copilot.retrieveWorkspace();
  await copilot.getTokenPayload?.();

  return (
    <Container>
      {/* Use key to ensure component fully re-mounts when project ID changes */}
      <ProjectDetail
        key={`project-detail-${projectId}`}
        projectId={projectId}
        token={token}
      />
    </Container>
  );
}

export default function ProjectPage({
  params,
  searchParams,
}: ProjectPageProps) {
  const { id } = params;
  const { token } = searchParams;

  return (
    <TokenGate searchParams={searchParams}>
      <Content projectId={id} token={token} />
    </TokenGate>
  );
}
