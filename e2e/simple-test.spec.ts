import { test, expect, Page } from '@playwright/test';
import { injectSdkMocksToPage } from './setup/browser-mocks';

test.describe('Basic app tests', () => {
  test('Basic page loads with HTML content', async ({ page }) => {
    // Inject SDK mocks before navigating
    await injectSdkMocksToPage(page);

    // Navigate to the main page
    await page.goto('/');

    // Wait for the page to load
    await page.waitForTimeout(2000);

    // Check that basic HTML elements are present (body)
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 });

    // Check that we can find "main" or other basic structure element
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 });

    // Take a screenshot to see what's actually rendering
    await page.screenshot({ path: 'test-results/basic-page-screenshot.png' });

    console.log('Homepage test completed successfully!');
  });
});
