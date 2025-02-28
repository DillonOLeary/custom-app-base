import { test, expect } from '@playwright/test';

/**
 * This test file verifies the security of the application by ensuring
 * that when not in a test/development environment, the application
 * properly requires authentication tokens.
 *
 * We now use the security-test page which has forceValidation=true to
 * guarantee token validation regardless of environment settings.
 */

test.describe('Application Security Tests', () => {
  test('Security test endpoint should require a token', async ({ page }) => {
    // Visit the security test page without a token
    await page.goto('/security-test');

    // Wait a bit to make sure page has a chance to render
    await page.waitForTimeout(2000);

    // Take a screenshot to verify what's shown
    await page.screenshot({ path: 'test-results/security-test-no-token.png' });

    // Check for error message
    const errorVisible = await page
      .getByText('Session Token is required')
      .isVisible()
      .catch(() => {
        const bodyText = page.evaluate(() => document.body.innerText);
        console.log('Page body text:', bodyText);
        return false;
      });

    expect(errorVisible).toBe(true);
  });

  test('Security test endpoint should accept valid tokens', async ({
    page,
  }) => {
    // Visit with token
    await page.goto('/security-test?token=test-token');
    await page.waitForTimeout(2000);

    // Check for success message
    const successVisible = await page
      .getByText('Authentication successful')
      .isVisible();
    expect(successVisible).toBe(true);
  });
});
