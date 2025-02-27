/**
 * This file contains setup code for E2E tests
 * It enables consistent testing when transitioning to a real database
 */

// Import testing libraries
import { Page } from '@playwright/test';
import { setupSdkMocks } from './setup/sdk-mock';

/**
 * Initialize test environment
 * Sets up mocks and ensures consistent test state
 */
export function initTestEnvironment(): void {
  // Set up the Copilot SDK mocks
  setupSdkMocks();

  // Ensure we have proper environment variables set for tests
  process.env.COPILOT_ENV = 'local';

  // We can't directly set NODE_ENV as it's read-only in TypeScript
  // But we can use this approach to test for it in our components
  if (process.env.NODE_ENV !== 'test') {
    console.log('Setting test environment mode');
    // @ts-ignore - Need to override for testing purposes
    process.env.NODE_ENV = 'test';
  }

  console.log('Test environment initialized');
}

// Initialize the test environment when this module is loaded
initTestEnvironment();

/**
 * Reset database state for tests
 * Currently uses mock data, but will connect to test database in the future
 *
 * This function ensures test data is consistent between runs
 */
export async function resetTestDatabase(): Promise<void> {
  // In the future, this would reset a test database to a known state
  // For now, our mock data is already consistent

  // When a real database is implemented, we'll need to:
  // 1. Connect to a test database
  // 2. Clear existing data
  // 3. Seed with test fixtures
  // 4. Disconnect

  console.log('Test environment reset complete');
}

/**
 * Create a predefined test project
 * This ensures consistency when E2E tests need a specific project state
 */
export async function createTestProject(
  page: Page,
  options: {
    name: string;
    type: string;
    location: string;
    capacity: number;
  },
): Promise<string> {
  // Go to projects page
  await page.goto('/');

  // Click create project button
  await page.getByTestId('create-project-button').click();

  // Fill in project details
  await page.getByTestId('project-name-input').fill(options.name);
  await page.getByTestId('project-location-input').fill(options.location);
  await page.getByTestId('project-type-select').selectOption(options.type);
  await page
    .getByTestId('project-capacity-input')
    .fill(options.capacity.toString());

  // Submit form
  await page.getByTestId('submit-project-button').click();

  // Return the project name for reference
  return options.name;
}

/**
 * Get standard test projects to use in tests
 * This provides consistent projects across all tests
 */
export function getStandardTestProjects() {
  return {
    completed: {
      id: '1',
      name: 'DESERT SUN SOLAR FARM',
      location: 'Arizona, USA',
      type: 'solar',
      capacity: 150,
    },
    analyzing: {
      id: '2',
      name: 'COASTAL WINDS',
      location: 'Maine, USA',
      type: 'wind',
      capacity: 75,
    },
    pending: {
      id: '3',
      name: 'MOUNTAIN STREAM HYDRO',
      location: 'Colorado, USA',
      type: 'hydro',
      capacity: 25,
    },
  };
}
