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
  }

  // Create the client with the provided token (if any)
  const client = copilotApi({
    apiKey: process.env.COPILOT_API_KEY || '',
    token: typeof token === 'string' ? token : undefined,
  });

  return {
    client,
    shouldSkipValidation,
  };
}

/**
 * Safely validates a Copilot SDK token with proper error handling for
 * test/CI environments
 *
 * @param token Session token to validate
 * @returns Whether validation succeeded and any error message
 */
export async function validateCopilotToken(token?: string) {
  try {
    const { client, shouldSkipValidation } = createCopilotClient(token);

    // Skip actual validation if we're in a test/CI environment
    if (shouldSkipValidation) {
      return { isValid: true, error: null };
    }

    // Basic SDK validation by retrieving workspace data
    await client.retrieveWorkspace();

    if (typeof client.getTokenPayload === 'function') {
      await client.getTokenPayload();
    }

    return { isValid: true, error: null };
  } catch (error) {
    // In test/CI, we don't want the error to block execution
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
