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
  },
};

let sdkMockEnabled = false;

/**
 * Simple mock function implementation for Playwright tests
 * which don't have access to Jest's mocking utilities
 */
function createMockFunction() {
  const fn = function (...args: any[]) {
    fn.calls.push(args);
    if (fn.implementation) {
      return fn.implementation(...args);
    }
    return undefined;
  };

  fn.calls = [] as any[][];
  fn.implementation = null as any;

  fn.mockImplementation = function (impl: any) {
    fn.implementation = impl;
    return fn;
  };

  fn.mockResolvedValue = function (value: any) {
    fn.implementation = () => Promise.resolve(value);
    return fn;
  };

  fn.mockReturnValue = function (value: any) {
    fn.implementation = () => value;
    return fn;
  };

  return fn;
}

/**
 * Setup Copilot SDK mocks for testing
 * This should be called before running tests
 */
export function setupSdkMocks() {
  if (typeof window !== 'undefined') {
    // Mock the SDK in the browser environment
    sdkMockEnabled = true;

    // Create the mock implementation for use in Playwright tests
    const mockSdk = {
      retrieveWorkspace: createMockFunction().mockResolvedValue(
        mockResponses.workspace,
      ),
      getTokenPayload: createMockFunction().mockResolvedValue(
        mockResponses.tokenPayload,
      ),
      getProjects: createMockFunction().mockResolvedValue(
        mockResponses.projects,
      ),
      getProjectById: createMockFunction().mockImplementation((id: string) => {
        return Promise.resolve(
          mockResponses.projects.find((p) => p.id === id) || null,
        );
      }),
      createProject: createMockFunction().mockImplementation((project: any) => {
        const newProject = {
          id: `new-${Date.now()}`,
          ...project,
          status: 'pending',
        };
        return Promise.resolve(newProject);
      }),
    };

    // Mock the copilotApi function
    const mockCopilotApi = createMockFunction().mockImplementation(
      () => mockSdk,
    );
    (window as any).copilotApi = mockCopilotApi;

    console.log('[Mock] Copilot SDK mock initialized for browser');
  }

  console.log('Copilot SDK mocks initialized for testing');
}

// Export mock data for use in tests
export const mockData = mockResponses;
