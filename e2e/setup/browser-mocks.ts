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
// Mock file data for testing
const mockFiles = [
  {
    id: 'file1',
    fileName: 'Financial_Projections_2023.xlsx',
    fileSize: 1024000,
    uploadDate: '2023-01-10T00:00:00Z',
    status: 'completed',
    path: 'Financial/',
    downloadUrl: '#download',
  },
  {
    id: 'file2',
    fileName: 'Site_Assessment_Report.pdf',
    fileSize: 2048000,
    uploadDate: '2023-01-05T00:00:00Z',
    status: 'completed',
    path: 'Technical/',
    downloadUrl: '#download',
  },
  {
    id: 'file3',
    fileName: 'Environmental_Impact_Study.pdf',
    fileSize: 3072000,
    uploadDate: '2023-01-03T00:00:00Z',
    status: 'completed',
    path: 'Environmental/',
    downloadUrl: '#download',
  },
  {
    id: 'file4',
    fileName: 'Community_Engagement_Plan.docx',
    fileSize: 512000,
    uploadDate: '2023-01-08T00:00:00Z',
    status: 'completed',
    path: 'Social/',
    downloadUrl: '#download',
  },
  {
    id: 'file5',
    fileName: 'Permit_Applications.zip',
    fileSize: 4096000,
    uploadDate: '2023-01-01T00:00:00Z',
    status: 'completed',
    path: 'Regulatory/',
    downloadUrl: '#download',
  },
];

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
        const project = ${JSON.stringify(mockData.projects)}.find(p => p.id === id);
        return project || ${JSON.stringify(mockData.projects[0])};
      },
      createProject: async (project) => {
        console.log('[Mock] Creating project:', project);
        return {
          id: 'new-project-id',
          ...project,
          status: 'pending'
        };
      },
      getProjectFiles: async (projectId) => {
        console.log('[Mock] Getting files for project:', projectId);
        return ${JSON.stringify(mockFiles)};
      },
      runAnalysis: async (projectId) => {
        console.log('[Mock] Running analysis for project:', projectId);
        // Return a success response 
        return { success: true };
      }
    };

    // Override the copilotApi function
    window.copilotApi = function(config) {
      console.log('[Mock] Initializing Copilot SDK with:', config);
      return window.mockCopilotSdk;
    };
    
    // Also make process.env.NODE_ENV return 'test' in browser context
    if (!window.process) {
      window.process = {};
    }
    if (!window.process.env) {
      window.process.env = {};
    }
    window.process.env.NODE_ENV = 'test';
    window.process.env.NEXT_PUBLIC_TEST_MODE = 'true';
    
    console.log('[Mock] Copilot SDK mock injected into browser');
  `;

  // Add the script to the page before it loads
  await page.addInitScript(sdkMockScript);

  console.log('SDK mocks injected into browser');
}
