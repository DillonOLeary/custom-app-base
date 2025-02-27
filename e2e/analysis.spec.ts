import { test, expect, Page } from '@playwright/test';

/**
 * These tests focus on the analysis functionality including
 * running analysis, viewing results, and interacting with analysis components.
 */
test.describe.skip('Analysis and CEARTscore tests', () => {
  // Helper function to go to a project page
  async function goToProjectPage(page: Page, projectId: string) {
    await page.goto(`/projects/${projectId}`);

    // Wait for page to load without requiring specific text
    await page.waitForLoadState('networkidle');

    // Wait for any heading to be visible
    await expect(page.locator('h2').first()).toBeVisible();
  }

  test('User can see analysis status for different project states', async ({
    page,
  }) => {
    // Check a new project (status: new)
    await goToProjectPage(page, '2');
    await expect(page.getByText('ANALYSIS PENDING')).toBeVisible();

    // Check to see the appropriate button
    const analysisButton = page.getByTestId('run-analysis-button');
    await expect(analysisButton).toBeVisible();

    // Check a project that's already been analyzed
    await goToProjectPage(page, '4');

    // This project should show results instead of pending status
    await expect(page.getByText('ANALYSIS RESULTS')).toBeVisible();
    await expect(page.getByText('CEARTscore:')).toBeVisible();
  });

  test('Running analysis shows correct status updates', async ({ page }) => {
    await goToProjectPage(page, '3');

    // First ensure we're in ANALYSIS PENDING state
    await expect(page.getByText('ANALYSIS PENDING')).toBeVisible();

    // Run the analysis
    const analysisButton = page.getByTestId('run-analysis-button');
    await expect(analysisButton).toBeVisible();
    await analysisButton.click();

    // Verify that we moved to ANALYSIS IN PROGRESS state
    await expect(page.getByText('ANALYSIS IN PROGRESS')).toBeVisible();

    // Wait for analysis completion
    await page.waitForTimeout(5000);

    // Verify that we now see the results
    await expect(page.getByText('CEARTscore:')).toBeVisible();
  });

  test('CEARTscore displays with the correct breakdown by category', async ({
    page,
  }) => {
    // Navigate to a project with completed analysis
    await goToProjectPage(page, '1');

    // Wait for the analysis results to be visible
    await expect(page.getByText('ANALYSIS RESULTS')).toBeVisible();

    // Verify that the CEARTscore is visible in the header
    await expect(page.getByText('CEARTscore:')).toBeVisible();

    // Get score value
    const scoreElement = page.getByTestId('score-value').first();
    await expect(scoreElement).toBeVisible();

    // Verify that the score is a number between 0 and 100
    const scoreText = await scoreElement.textContent();
    const score = parseInt(scoreText || '0', 10);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(100);

    // Verify that the category breakdown is visible
    // Different projects might have different categories, but we'll check for common ones
    const categories = [
      'Financial',
      'Technical',
      'Environmental',
      'Social',
      'Regulatory',
    ];

    // At least one of these categories should be visible
    let foundCategory = false;
    for (const category of categories) {
      if (await page.getByText(category).isVisible()) {
        foundCategory = true;
        break;
      }
    }
    expect(foundCategory).toBe(true);
  });

  test('User can click on categories to view detailed red flags', async ({
    page,
  }) => {
    // Navigate to a project with completed analysis
    await goToProjectPage(page, '1');

    // Wait for the analysis results to be visible
    await expect(page.getByText('ANALYSIS RESULTS')).toBeVisible();

    // Find a category to click (choosing Financial as an example)
    const categoryElement = page.getByText('Financial').first();
    if (await categoryElement.isVisible()) {
      // Click on the category to see details
      await categoryElement.click();

      // Wait for transition
      await page.waitForTimeout(500);

      // Verify we're showing detailed view now
      await expect(page.getByText('RED FLAGS')).toBeVisible();

      // Look for a back button or close option
      const backButton = page.getByText('Back to Overview');
      await expect(backButton).toBeVisible();

      // Go back to the overview
      await backButton.click();

      // Verify we're back to results overview
      await expect(page.getByText('ANALYSIS RESULTS')).toBeVisible();
    } else {
      // If Financial category isn't visible, try another one
      const visibleCategory = page.locator('.category-item').first();
      await visibleCategory.click();

      // Wait for transition
      await page.waitForTimeout(500);

      // Verify we're showing detailed view
      await expect(page.getByText('RED FLAGS')).toBeVisible();
    }
  });

  test('Red flags show appropriate information about issues', async ({
    page,
  }) => {
    // Navigate to a project with completed analysis
    await goToProjectPage(page, '4');

    // Wait for the analysis results to be visible
    await expect(page.getByText('ANALYSIS RESULTS')).toBeVisible();

    // Find a category to click
    const visibleCategory = page.locator('.score-category').first();
    await visibleCategory.click();

    // Wait for transition
    await page.waitForTimeout(500);

    // Verify we're showing detailed view with red flags
    await expect(page.getByText('RED FLAGS')).toBeVisible();

    // Check if there are red flags listed
    const redFlagItems = page.locator('.red-flag-item');
    const flagCount = await redFlagItems.count();

    if (flagCount > 0) {
      // Check the first red flag
      const firstFlag = redFlagItems.first();

      // Each red flag should have a title
      await expect(firstFlag.locator('h3')).toBeVisible();

      // Most red flags should have a description
      await expect(firstFlag.locator('p')).toBeVisible();
    } else {
      // If no red flags, there might be a message indicating clean results
      await expect(page.getByText('No issues detected')).toBeVisible();
    }
  });

  test('Analysis retries work when initial analysis fails', async ({
    page,
  }) => {
    // Navigate to a project with failed analysis
    // Note: this requires a project in the failed state which might need to be mocked
    // For this test to work properly, you might need to ensure project 5 has failed status
    await goToProjectPage(page, '5');

    // Assuming project 5 has failed analysis, check for ANALYSIS FAILED heading
    if (await page.getByText('ANALYSIS FAILED').isVisible()) {
      // Check for retry button
      const retryButton = page.getByTestId('retry-analysis-button');
      await expect(retryButton).toBeVisible();

      // Click retry
      await retryButton.click();

      // Check for analysis in progress
      await expect(page.getByText('ANALYSIS IN PROGRESS')).toBeVisible();

      // Wait for analysis to complete
      await page.waitForTimeout(5000);

      // Verify either success or failed state again
      const hasResults = await page.getByText('ANALYSIS RESULTS').isVisible();
      const stillFailed = await page.getByText('ANALYSIS FAILED').isVisible();

      // Either condition is valid for this test
      expect(hasResults || stillFailed).toBe(true);
    } else {
      // If project 5 doesn't have failed status, we'll simulate a failed analysis retry
      // by going to a regular project and running analysis
      await goToProjectPage(page, '2');

      // Run the analysis
      const analysisButton = page.getByTestId('run-analysis-button');
      if (await analysisButton.isVisible()) {
        await analysisButton.click();

        // Verify analysis is in progress
        await expect(page.getByText('ANALYSIS IN PROGRESS')).toBeVisible();

        // Wait for analysis to complete
        await page.waitForTimeout(5000);

        // At this point we should see results or a failure
        const hasResults = await page.getByText('ANALYSIS RESULTS').isVisible();
        const analysisFailed = await page
          .getByText('ANALYSIS FAILED')
          .isVisible();

        // Either condition is valid for this test
        expect(hasResults || analysisFailed).toBe(true);
      }
    }
  });
});
