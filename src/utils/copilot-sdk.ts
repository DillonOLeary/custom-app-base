import { copilotApi } from 'copilot-node-sdk';
import { shouldSkipSDKValidation } from './environment';

/**
 * Creates and configures the Copilot SDK client with appropriate error handling
 * for different environments (local development, testing, CI, production)
 *
 * @param token Optional session token
 * @returns Configured Copilot SDK client
 */
export function createCopilotClient(token?: string) {
  const shouldSkipValidation = shouldSkipSDKValidation();

  if (shouldSkipValidation) {
    console.log(
      'Creating Copilot client with SDK validation disabled (test/CI environment)',
    );

    // Return a mock client for test/CI environments instead of trying to use the real SDK
    const mockClient = {
      // Mock implementations of all methods used in the app
      retrieveWorkspace: async () => ({
        id: 'mock-workspace-id',
        name: 'Mock Workspace',
        portalUrl: 'https://example.com/portal',
        owner: 'mock-user-id',
      }),
      getTokenPayload: async () => ({
        sub: 'mock-user-id',
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
        iat: Math.floor(Date.now() / 1000) - 60, // 1 minute ago
        workspaceId: 'mock-workspace-id',
        userId: 'mock-user-id',
      }),
      getProjects: async () => {
        return [
          {
            id: '1',
            name: 'DESERT SUN SOLAR FARM',
            location: 'Arizona, USA',
            type: 'solar',
            capacity: 150,
            status: 'completed',
            score: 87,
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-15T00:00:00Z',
          },
          {
            id: '2',
            name: 'COASTAL WINDS',
            location: 'Maine, USA',
            type: 'wind',
            capacity: 75,
            status: 'pending',
            createdAt: '2023-02-01T00:00:00Z',
            updatedAt: '2023-02-10T00:00:00Z',
          },
        ];
      },
      getProjectById: async (id: string) => {
        if (id === '1') {
          return {
            id: '1',
            name: 'DESERT SUN SOLAR FARM',
            location: 'Arizona, USA',
            type: 'solar',
            capacity: 150,
            status: 'completed',
            score: 87,
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-15T00:00:00Z',
          };
        }
        return null;
      },
      createProject: async (project: any) => {
        return {
          id: `new-${Date.now()}`,
          ...project,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      },
      // Add other methods as needed
    };

    return {
      client: mockClient,
      shouldSkipValidation,
    };
  }

  try {
    // Create the client with the provided token (if any)
    const client = copilotApi({
      apiKey: process.env.COPILOT_API_KEY || '',
      token: typeof token === 'string' ? token : undefined,
    });

    return {
      client,
      shouldSkipValidation,
    };
  } catch (error) {
    console.error('Error creating Copilot SDK client:', error);

    if (shouldSkipValidation) {
      console.log(
        'Falling back to mock client due to SDK initialization error',
      );
      // Return mock client as fallback
      return {
        client: {
          retrieveWorkspace: async () => ({
            id: 'mock-workspace-id',
            name: 'Mock Workspace',
            portalUrl: 'https://example.com/portal',
            owner: 'mock-user-id',
          }),
          getTokenPayload: async () => null,
          // Add other methods as needed
        },
        shouldSkipValidation,
      };
    }

    // In production, rethrow the error
    throw error;
  }
}

/**
 * Safely validates a Copilot SDK token with proper error handling for
 * test/CI environments
 *
 * @param token Session token to validate
 * @returns Whether validation succeeded and any error message
 */
export async function validateCopilotToken(token?: string) {
  // First check if we should skip validation (test/CI environment)
  if (shouldSkipSDKValidation()) {
    console.log('Skipping token validation in test/CI environment');
    return { isValid: true, error: null };
  }

  try {
    const { client } = createCopilotClient(token);

    // Basic SDK validation by retrieving workspace data
    await client.retrieveWorkspace();

    if (typeof client.getTokenPayload === 'function') {
      await client.getTokenPayload();
    }

    return { isValid: true, error: null };
  } catch (error) {
    // Double-check if we're in test/CI environment (in case environment changed)
    if (shouldSkipSDKValidation()) {
      console.log(
        'SDK validation error in test/CI environment (ignoring):',
        error,
      );
      return { isValid: true, error: null };
    }

    // In production, return the error
    return {
      isValid: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
