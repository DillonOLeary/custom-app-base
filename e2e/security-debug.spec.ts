import { test, expect } from '@playwright/test';

/**
 * Debugging version of security tests that provides more detailed output
 * We now use the dedicated security-test page which has forceValidation=true
 *
 * This test is marked to be skipped in normal runs and only used for debugging.
 */

// Mark the entire file as skip for now
test.skip();

test.describe('Application Security Tests (Debug Version)', () => {
  test.beforeEach(async ({ page }) => {
    // Create a special global "SECURITY_TEST_MODE" that our custom mock will check for
    await page.addInitScript(`
      // Explicitly set TEST_MODE to false first
      window.__TEST_MODE__ = false;
      
      // Set the SECURITY_TEST_MODE flag which our TokenGate now respects directly
      window.SECURITY_TEST_MODE = true;
      
      // Override environment variables in the browser
      if (!window.process) {
        window.process = {};
      }
      if (!window.process.env) {
        window.process.env = {};
      }
      
      // Set environment variables to force security checks
      window.process.env.NODE_ENV = 'production';
      window.process.env.ENFORCE_SDK_VALIDATION = 'true';
      window.process.env.NEXT_PUBLIC_TEST_MODE = 'false';
      window.process.env.CI = 'false';
      window.process.env.COPILOT_ENV = '';
      
      // We no longer need to override these functions since our updated TokenGate
      // handles the SECURITY_TEST_MODE flag directly, but we'll keep them for backward compatibility
      window.isTestOrCIEnvironment = function() {
        console.log('[Security Debug] isTestOrCIEnvironment called, returning false');
        return false;
      };
      
      window.shouldSkipSDKValidation = function() {
        console.log('[Security Debug] shouldSkipSDKValidation called, returning false');
        return false;
      };
      
      console.log('[Security Debug] Security test mode enabled with environment:', {
        NODE_ENV: window.process.env.NODE_ENV,
        ENFORCE_SDK_VALIDATION: window.process.env.ENFORCE_SDK_VALIDATION,
        NEXT_PUBLIC_TEST_MODE: window.process.env.NEXT_PUBLIC_TEST_MODE,
        COPILOT_ENV: window.process.env.COPILOT_ENV,
        CI: window.process.env.CI
      });
      
      // Add observer to watch for DOM changes and log them
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            console.log('[Security Debug] DOM updated with new elements');
            // Check for error messages
            const errorTexts = document.body.innerText.match(/Session Token is required|Error|Failed/g);
            if (errorTexts) {
              console.log('[Security Debug] Found error texts in DOM:', errorTexts);
            }
          }
        });
      });
      
      // Start observing once DOM is ready
      document.addEventListener('DOMContentLoaded', () => {
        observer.observe(document.body, { childList: true, subtree: true });
        console.log('[Security Debug] DOM observer started');
      });
    `);

    // Log when each test starts
    console.log('Starting security test...');
  });

  test('Application should require authentication in production mode', async ({
    page,
  }) => {
    // Take screenshots to debug the rendering
    console.log('Navigating to home without token...');

    // Visit home page without a token
    await page.goto('/', { timeout: 30000 });

    // Add debug wait and screenshot
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/security-no-token.png' });
    console.log('Took screenshot of page without token');

    // Log the HTML for debugging
    const html = await page.content();
    console.log('HTML length:', html.length);
    require('fs').writeFileSync('test-results/security-no-token.html', html);

    // Check for the error message about session token
    console.log('Checking for error message...');
    const errorMessage = await page
      .getByText('Session Token is required')
      .first();

    const isVisible = await errorMessage
      .isVisible({ timeout: 5000 })
      .catch(() => {
        console.log('Error message not found or not visible');
        return false;
      });

    console.log('Error message visible:', isVisible);

    // More lenient check that looks for the text anywhere in the DOM
    let bodyText = '';
    if (!isVisible) {
      bodyText = await page.evaluate(() => document.body.innerText);
      console.log(
        'Body text contains error:',
        bodyText.includes('Session Token is required'),
      );
      console.log('Full body text:', bodyText);
    }

    // Now try with a token parameter
    console.log('Navigating with token parameter...');
    await page.goto('/?token=test-token', { timeout: 30000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/security-with-token.png' });

    // Verify content loads with a token
    const projectsHeader = await page.getByText('Projects').first();
    const projectsVisible = await projectsHeader
      .isVisible({ timeout: 5000 })
      .catch(() => {
        console.log('Projects header not found with token');
        return false;
      });

    console.log('Projects header visible with token:', projectsVisible);

    // Final verification with expect
    expect(
      isVisible || (bodyText && bodyText.includes('Session Token is required')),
    ).toBe(true);
  });
});
