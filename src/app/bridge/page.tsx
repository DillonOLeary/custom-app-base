import { Body, Heading, Icon } from 'copilot-design-system';
import { Container } from '@/components/common/Container';
import { Demo } from '@/app/bridge/demo';
import type { SearchParams } from '../search-params';
import { createCopilotClient } from '@/utils/copilot-sdk';
import { shouldSkipSDKValidation } from '@/utils/environment';

export default async function Page({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { token } = searchParams;

  console.log('Bridge page environment:', {
    NODE_ENV: process.env.NODE_ENV,
    COPILOT_ENV: process.env.COPILOT_ENV,
    shouldSkipSDKValidation: shouldSkipSDKValidation(),
  });

  // Use our centralized client creation
  const { client } = createCopilotClient(
    typeof token === 'string' ? token : undefined,
  );

  // In test/CI environments, use a mock workspace
  let workspace;
  try {
    workspace = await client.retrieveWorkspace();
  } catch (error) {
    if (shouldSkipSDKValidation()) {
      console.log('Using mock workspace data in test environment');
      workspace = { portalUrl: 'https://example.com/portal' };
    } else {
      throw error;
    }
  }

  return (
    <Container className="max-w-screen-lg">
      <Demo portalUrl={workspace.portalUrl} />
    </Container>
  );
}
