import { defineConfig, devices } from '@playwright/test';

console.log('Configuring Playwright with environment:', {
  NODE_ENV: process.env.NODE_ENV,
  COPILOT_ENV: process.env.COPILOT_ENV,
  CI: process.env.CI,
});

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Pass environment variables to the browser context
    contextOptions: {
      baseURL: 'http://localhost:3000',
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'COPILOT_ENV=local NEXT_PUBLIC_TEST_MODE=true yarn dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      COPILOT_ENV: 'local',
      NEXT_PUBLIC_TEST_MODE: 'true',
      NODE_ENV: 'test',
      CI: 'true', // Force CI mode even in local development
    },
    // Wait longer for the server in CI environments
    timeout: process.env.CI ? 180000 : 60000,
  },
});
