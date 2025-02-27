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
};

/**
 * Setup Copilot SDK mocks for testing
 * This should be called before running tests
 */
export function setupSdkMocks() {
  // Since the tests are already using mock data in the API routes,
  // we don't need to do additional setup here.
  // This function is a placeholder for when we need to mock more complex SDK behavior.

  // In a real implementation, we might need to:
  // 1. Intercept SDK initialization
  // 2. Replace SDK methods with mocks
  // 3. Return predefined responses

  console.log('Copilot SDK mocks initialized for testing');
}

// Export mock data for use in tests
export const mockData = mockResponses;
