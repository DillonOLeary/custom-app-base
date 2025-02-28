import { test, expect } from '@playwright/test';

/**
 * Tests the dedicated security-test endpoint which enforces token validation
 */
test.describe('Security Test Endpoint Tests', () => {
  test('Security test page should require a token', async ({ page }) => {
    // Try to access the security test page without a token
    await page.goto('/security-test');

    // Wait a bit to make sure page has a chance to render
    await page.waitForTimeout(2000);

    // Take a screenshot to verify what's shown
    await page.screenshot({
      path: 'test-results/security-endpoint-no-token.png',
    });

    // Check if we got an error message about missing token
    const errorVisible = await page
      .getByText('Session Token is required')
      .isVisible()
      .catch(() => false);

    // If the direct check didn't find the error, check the entire page text
    if (!errorVisible) {
      const pageText = await page.evaluate(() => document.body.innerText);
      console.log('Page text:', pageText);

      // The test passes if either we found the visible error or the text includes the error message
      expect(pageText.includes('Session Token is required')).toBe(true);
    } else {
      expect(errorVisible).toBe(true);
    }

    // Now try with a token
    await page.goto('/security-test?token=test-token');
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: 'test-results/security-endpoint-with-token.png',
    });

    // Check for success message
    const successVisible = await page
      .getByText('Authentication successful')
      .isVisible();
    expect(successVisible).toBe(true);
  });
});
