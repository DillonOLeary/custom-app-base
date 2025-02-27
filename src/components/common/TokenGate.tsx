import type { SearchParams } from '@/app/search-params';

export function TokenGate({
  children,
  searchParams,
}: {
  children: React.ReactNode;
  searchParams: SearchParams;
}) {
  // For demo purposes, always pass through the TokenGate in production
  // This allows the app to run without a valid token when deployed
  // In a real app, you'd want real token validation
  if (process.env.NODE_ENV === 'production') {
    return children;
  }

  // Only enforce token requirement in development when not in local mode
  if (!searchParams.token && process.env.COPILOT_ENV !== 'local') {
    throw new Error(
      'Session Token is required, guide available at: https://docs.copilot.com/docs/custom-apps-setting-up-the-sdk#session-tokens',
    );
  }

  return children;
}
