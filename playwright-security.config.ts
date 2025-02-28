import { defineConfig, devices } from '@playwright/test';

console.log('Configuring Playwright for security tests with environment:', {
  NODE_ENV: process.env.NODE_ENV,
  COPILOT_ENV: process.env.COPILOT_ENV,
  CI: process.env.CI,
});

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: false,
  retries: 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'on',
    contextOptions: {
      baseURL: 'http://localhost:3001',
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'ENFORCE_SDK_VALIDATION=true next dev -p 3001',
    url: 'http://localhost:3001',
    reuseExistingServer: false,
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      ENFORCE_SDK_VALIDATION: 'true',
      NODE_ENV: 'production',
    },
    timeout: 60000,
  },
});
