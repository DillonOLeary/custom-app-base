/**
 * Mock implementation for Copilot SDK to use in tests
 * This ensures tests can run in CI environments without actual Copilot credentials
 */

// Mock SDK responses for common API requests
const mockResponses = {
  // Add mock responses for any SDK calls that your application makes
  projects: [
    {
      id: '1',
      name: 'DESERT SUN SOLAR FARM',
      location: 'Arizona, USA',
      type: 'solar',
      capacity: 150,
      status: 'completed',
      score: 87,
    },
    {
      id: '2',
      name: 'COASTAL WINDS',
      location: 'Maine, USA',
      type: 'wind',
      capacity: 75,
      status: 'analyzing',
    },
    {
      id: '3',
      name: 'MOUNTAIN STREAM HYDRO',
      location: 'Colorado, USA',
      type: 'hydro',
      capacity: 25,
      status: 'pending',
    },
  ],
  tokenPayload: {
    userId: 'test-user-id',
    workspaceId: 'test-workspace-id',
    exp: Date.now() + 3600000, // One hour from now
  },
  workspace: {
    id: 'test-workspace-id',
    name: 'Test Workspace',
    owner: 'test-user-id',
  }
};

// Store original implementations
const originalModule = jest.requireActual('copilot-node-sdk');
let sdkMockEnabled = false;

/**
 * Setup Copilot SDK mocks for testing
 * This should be called before running tests
 */
export function setupSdkMocks() {
  if (typeof window !== 'undefined') {
    // Mock the SDK in the browser environment
    sdkMockEnabled = true;
    
    // Mock the copilotApi function
    (window as any).copilotApi = jest.fn().mockImplementation(() => ({
      retrieveWorkspace: jest.fn().mockResolvedValue(mockResponses.workspace),
      getTokenPayload: jest.fn().mockResolvedValue(mockResponses.tokenPayload),
      // Add other methods as needed
      getProjects: jest.fn().mockResolvedValue(mockResponses.projects),
      getProjectById: jest.fn().mockImplementation((id) => {
        return Promise.resolve(mockResponses.projects.find(p => p.id === id) || null);
      }),
      createProject: jest.fn().mockImplementation((project) => {
        const newProject = {
          id: `new-${Date.now()}`,
          ...project,
          status: 'pending',
        };
        return Promise.resolve(newProject);
      }),
    }));
  }
  
  // For server-side (Node.js) environment
  if (typeof jest !== 'undefined') {
    jest.mock('copilot-node-sdk', () => {
      return {
        ...originalModule,
        copilotApi: () => ({
          retrieveWorkspace: jest.fn().mockResolvedValue(mockResponses.workspace),
          getTokenPayload: jest.fn().mockResolvedValue(mockResponses.tokenPayload),
          // Add other methods as needed
          getProjects: jest.fn().mockResolvedValue(mockResponses.projects),
          getProjectById: jest.fn().mockImplementation((id) => {
            return Promise.resolve(mockResponses.projects.find(p => p.id === id) || null);
          }),
          createProject: jest.fn().mockImplementation((project) => {
            const newProject = {
              id: `new-${Date.now()}`,
              ...project,
              status: 'pending',
            };
            return Promise.resolve(newProject);
          }),
        }),
      };
    });
  }

  console.log('Copilot SDK mocks initialized for testing');
}

// Export mock data for use in tests
export const mockData = mockResponses;
