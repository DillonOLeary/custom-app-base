/**
 * Mock implementation for Copilot SDK to use in tests
 * This ensures tests can run in CI environments without actual Copilot credentials
 */

// Set specific environment variables for e2e tests
if (typeof process !== 'undefined') {
  process.env.COPILOT_ENV = 'local';
  process.env.NEXT_PUBLIC_TEST_MODE = 'true';
  process.env.CI = 'true'; // Ensure CI flag is set

  console.log('SDK mock setting environment variables:', {
    COPILOT_ENV: process.env.COPILOT_ENV,
    NEXT_PUBLIC_TEST_MODE: process.env.NEXT_PUBLIC_TEST_MODE,
    CI: process.env.CI,
  });
}

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
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-15T00:00:00Z',
      analysisResult: {
        totalScore: 87,
        lastUpdated: '2023-01-15T00:00:00Z',
        redFlagCount: 5,
        categoryScores: [
          {
            category: 'completeness',
            score: 18,
            maxScore: 20,
            redFlags: [
              {
                id: 'rf1',
                category: 'completeness',
                title: 'Missing Environmental Impact Report',
                description:
                  'The environmental impact assessment report is missing from the data room.',
                impact: 'medium',
                pointsDeducted: 2,
              },
            ],
          },
          {
            category: 'financialClaims',
            score: 16,
            maxScore: 20,
            redFlags: [
              {
                id: 'rf2',
                category: 'financialClaims',
                title: 'Inconsistent Revenue Projections',
                description:
                  'The financial model shows inconsistent revenue projections compared to market data.',
                impact: 'high',
                pointsDeducted: 4,
              },
            ],
          },
          {
            category: 'contractCoverage',
            score: 17,
            maxScore: 20,
            redFlags: [
              {
                id: 'rf3',
                category: 'contractCoverage',
                title: 'Missing Interconnection Agreement',
                description:
                  'The project is missing a finalized interconnection agreement.',
                impact: 'medium',
                pointsDeducted: 3,
              },
            ],
          },
          {
            category: 'contractQuality',
            score: 19,
            maxScore: 20,
            redFlags: [
              {
                id: 'rf4',
                category: 'contractQuality',
                title: 'Incomplete Termination Clause',
                description:
                  'The PPA contains an incomplete termination clause that may pose legal risks.',
                impact: 'low',
                pointsDeducted: 1,
              },
            ],
          },
          {
            category: 'reputationScreening',
            score: 17,
            maxScore: 20,
            redFlags: [
              {
                id: 'rf5',
                category: 'reputationScreening',
                title: 'Contractor Performance Issues',
                description:
                  'The EPC contractor has had performance issues on similar projects in the past.',
                impact: 'medium',
                pointsDeducted: 3,
              },
            ],
          },
        ],
      },
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
    {
      id: '3',
      name: 'MOUNTAIN STREAM HYDRO',
      location: 'Colorado, USA',
      type: 'hydro',
      capacity: 25,
      status: 'pending',
      createdAt: '2023-03-01T00:00:00Z',
      updatedAt: '2023-03-05T00:00:00Z',
    },
    {
      id: '4',
      name: 'GEOTHERMAL ENERGY PROJECT',
      location: 'Nevada, USA',
      type: 'geothermal',
      capacity: 50,
      status: 'completed',
      score: 92,
      createdAt: '2023-04-01T00:00:00Z',
      updatedAt: '2023-04-20T00:00:00Z',
      analysisResult: {
        totalScore: 92,
        lastUpdated: '2023-04-20T00:00:00Z',
        redFlagCount: 3,
        categoryScores: [
          {
            category: 'completeness',
            score: 19,
            maxScore: 20,
            redFlags: [
              {
                id: 'rf6',
                category: 'completeness',
                title: 'Missing Water Usage Report',
                description:
                  'The water usage report is missing from the documentation.',
                impact: 'low',
                pointsDeducted: 1,
              },
            ],
          },
          {
            category: 'financialClaims',
            score: 18,
            maxScore: 20,
            redFlags: [
              {
                id: 'rf7',
                category: 'financialClaims',
                title: 'Unclear O&M Cost Structure',
                description:
                  'The O&M cost structure is not clearly defined in the financial model.',
                impact: 'medium',
                pointsDeducted: 2,
              },
            ],
          },
          {
            category: 'contractCoverage',
            score: 20,
            maxScore: 20,
            redFlags: [],
          },
          {
            category: 'contractQuality',
            score: 20,
            maxScore: 20,
            redFlags: [],
          },
          {
            category: 'reputationScreening',
            score: 15,
            maxScore: 20,
            redFlags: [
              {
                id: 'rf8',
                category: 'reputationScreening',
                title: 'Past Regulatory Issues',
                description:
                  'The developer has had regulatory compliance issues in the past.',
                impact: 'high',
                pointsDeducted: 5,
              },
            ],
          },
        ],
      },
    },
    {
      id: '5',
      name: 'FAILED ANALYSIS PROJECT',
      location: 'Texas, USA',
      type: 'solar',
      capacity: 100,
      status: 'failed',
      createdAt: '2023-05-01T00:00:00Z',
      updatedAt: '2023-05-10T00:00:00Z',
      analysisError:
        'Insufficient data to complete analysis. Please upload more files.',
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
    portalUrl: 'https://example.com/portal',
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
