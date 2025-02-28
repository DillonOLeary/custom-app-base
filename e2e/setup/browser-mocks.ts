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
    // Helper function to ensure project data is valid
    function ensureProjectFields(project) {
      if (!project) {
        project = {
          id: 'default-id',
          name: 'Default Project',
          status: 'pending'
        };
      }
      
      // Make sure all required fields have default values
      return {
        id: project.id || 'unknown-id',
        name: project.name || 'Unnamed Project',
        location: project.location || 'Unknown Location',
        type: project.type || 'other',
        capacity: project.capacity || 0,
        status: project.status || 'pending',
        score: project.score,
        createdAt: project.createdAt || new Date().toISOString(),
        updatedAt: project.updatedAt || new Date().toISOString(),
        analysisResult: project.analysisResult ? {
          totalScore: project.analysisResult.totalScore || 0,
          lastUpdated: project.analysisResult.lastUpdated || new Date().toISOString(),
          redFlagCount: project.analysisResult.redFlagCount || 0,
          categoryScores: (project.analysisResult.categoryScores || []).map(cs => ({
            category: cs.category || 'unknown',
            score: cs.score || 0,
            maxScore: cs.maxScore || 20,
            redFlags: (cs.redFlags || []).map(rf => ({
              id: rf.id || \`rf-\${Date.now()}-\${Math.random()}\`,
              category: rf.category || cs.category || 'unknown',
              title: rf.title || 'Unknown Issue',
              description: rf.description || 'No description provided',
              impact: rf.impact || 'medium',
              pointsDeducted: rf.pointsDeducted || 1
            }))
          }))
        } : undefined,
        analysisError: project.analysisError
      };
    }
    
    // Helper function to ensure file data is valid
    function ensureFileFields(file) {
      if (!file) {
        file = {
          id: \`file-\${Date.now()}-\${Math.random()}\`,
          fileName: 'unknown-file.txt'
        };
      }
      
      return {
        id: file.id || \`file-\${Date.now()}-\${Math.random()}\`,
        fileName: file.fileName || 'unknown-file.txt',
        fileSize: file.fileSize || 0,
        uploadDate: file.uploadDate || new Date().toISOString(),
        status: file.status || 'pending',
        path: file.path || '',
        downloadUrl: file.downloadUrl || '#'
      };
    }
    
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
        const projects = ${JSON.stringify(mockData.projects)}.map(p => ensureProjectFields(p));
        return projects;
      },
      getProjectById: async (id) => {
        console.log('[Mock] Getting project by ID:', id);
        const project = ${JSON.stringify(mockData.projects)}.find(p => p.id === id);
        return ensureProjectFields(project || ${JSON.stringify(mockData.projects[0])});
      },
      createProject: async (project) => {
        console.log('[Mock] Creating project:', project);
        return ensureProjectFields({
          id: 'new-project-id',
          ...project,
          status: 'pending'
        });
      },
      getProjectFiles: async (projectId) => {
        console.log('[Mock] Getting files for project:', projectId);
        const defaultFiles = [
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
          }
        ];
        const files = defaultFiles.map(f => ensureFileFields(f));
        return files;
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
    
    // Set all test environment variables 
    window.process.env.NODE_ENV = 'test';
    window.process.env.NEXT_PUBLIC_TEST_MODE = 'true';
    window.process.env.COPILOT_ENV = 'local';
    window.process.env.CI = 'true';
    window.process.env.COPILOT_API_KEY = 'mock-api-key-for-testing';
    
    // Set window-level test flags
    window.__TEST_MODE__ = true;
    window.__COPILOT_ENV__ = 'local';
    window.__MOCK_SDK__ = true;
    
    // Add special function to check if environment is test/CI
    window.__isTestEnvironment = function() {
      return true;
    };
    
    // Override fetch for API calls if needed
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
      // For API requests that need special handling in tests
      if (typeof url === 'string' && url.includes('/api/')) {
        console.log('[Mock] Intercepting fetch for API URL:', url);
        
        // Example override for specific API endpoints
        if (url.includes('/api/projects')) {
          return Promise.resolve(new Response(JSON.stringify([
            { id: '1', name: 'DESERT SUN SOLAR FARM', score: 87 },
            { id: '2', name: 'COASTAL WINDS' }
          ]), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }));
        }
      }
      
      // Default to original fetch for non-API URLs
      return originalFetch(url, options);
    };
    
    console.log('[Mock] Test environment variables set in browser:', window.process.env);
    console.log('[Mock] Copilot SDK mock injected into browser');
  `;

  // Add the script to the page before it loads
  await page.addInitScript(sdkMockScript);

  console.log('SDK mocks injected into browser');
}
