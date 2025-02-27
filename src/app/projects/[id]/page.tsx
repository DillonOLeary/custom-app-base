import { Metadata } from 'next';
import { Project } from '@/types/project';
import { ProjectDetail } from '@/components/project-detail/ProjectDetail';
import { Container } from '@/components/common/Container';
import { TokenGate } from '@/components/common/TokenGate';

export const metadata: Metadata = {
  title: 'Project Details | CEART',
  description: 'Renewable Energy Project Details and Analysis',
};

type ProjectPageProps = {
  params: { id: string };
  searchParams: { token?: string };
};

export default function ProjectPage({
  params,
  searchParams,
}: ProjectPageProps) {
  const { id } = params;

  return (
    <TokenGate searchParams={searchParams}>
      <Container>
        {/* Use key to ensure component fully re-mounts when project ID changes */}
        <ProjectDetail key={`project-detail-${id}`} projectId={id} />
      </Container>
    </TokenGate>
  );
}
