/**
 * Browser-side mocks to inject into the page
 * These will automatically mock the Copilot SDK in the browser environment
 */

import { Page } from '@playwright/test';
import { mockData } from './sdk-mock';

/**
 * Inject SDK mocks into the browser page
 * This should be called at the start of each test that uses the Copilot SDK
 */
export async function injectSdkMocksToPage(page: Page): Promise<void> {
  // Define the mock implementation to be injected
  const sdkMockScript = `
    // Create a mock for the Copilot SDK
    window.mockCopilotSdk = {
      retrieveWorkspace: async () => {
        console.log('[Mock] Retrieving workspace');
        return ${JSON.stringify(mockData.workspace)};
      },
      getTokenPayload: async () => {
        console.log('[Mock] Getting token payload');
        return ${JSON.stringify(mockData.tokenPayload)};
      },
      getProjects: async () => {
        console.log('[Mock] Getting projects');
        return ${JSON.stringify(mockData.projects)};
      },
      getProjectById: async (id) => {
        console.log('[Mock] Getting project by ID:', id);
        return ${JSON.stringify(mockData.projects[0])};
      },
      createProject: async (project) => {
        console.log('[Mock] Creating project:', project);
        return {
          id: 'new-project-id',
          ...project,
          status: 'pending'
        };
      }
    };

    // Override the copilotApi function
    window.copilotApi = function(config) {
      console.log('[Mock] Initializing Copilot SDK with:', config);
      return window.mockCopilotSdk;
    };
    
    console.log('[Mock] Copilot SDK mock injected into browser');
  `;

  // Add the script to the page before it loads
  await page.addInitScript(sdkMockScript);
  
  console.log('SDK mocks injected into browser');
}