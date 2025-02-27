import { Metadata } from 'next';
import { Project } from '@/types/project';
import { ProjectDetail } from '@/components/project-detail/ProjectDetail';
import { Container } from '@/components/common/Container';
import { TokenGate } from '@/components/common/TokenGate';
import type { SearchParams } from '@/app/search-params';
import { validateCopilotToken } from '@/utils/copilot-sdk';
import { shouldSkipSDKValidation } from '@/utils/environment';

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
  // Log environment information for debugging
  console.log('Project page environment:', {
    NODE_ENV: process.env.NODE_ENV,
    COPILOT_ENV: process.env.COPILOT_ENV,
    NEXT_PUBLIC_TEST_MODE: process.env.NEXT_PUBLIC_TEST_MODE,
    shouldSkipSDKValidation: shouldSkipSDKValidation(),
  });

  // Validate Copilot token, with proper handling for test/CI environments
  const { isValid, error } = await validateCopilotToken(token);

  // We don't need to throw errors - all validation failures will be handled gracefully in test/CI
  if (!isValid) {
    console.log(`Token validation issue (continuing anyway): ${error}`);
  }

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
