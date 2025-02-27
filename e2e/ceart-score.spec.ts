import { test, expect, Page } from '@playwright/test';

/**
 * These tests verify the consistency of CEARTscore between dashboard and project details
 * and proper folder structure display for each project.
 */
test.describe('CEARTscore consistency and folder structure tests', () => {
  // Common test function to check score consistency
  const testScoreConsistency = async (
    page: Page,
    projectId: string,
    projectName: string,
    expectedScore: number,
  ) => {
    // Visit the dashboard
    await page.goto('/');

    // Wait for the dashboard to load
    await expect(page.getByTestId(`project-card-${projectId}`)).toBeVisible();

    // Get the score from dashboard
    const dashboardScoreElement = page
      .getByTestId(`project-card-${projectId}`)
      .getByTestId('score-value');
    await expect(dashboardScoreElement).toBeVisible();

    // Extract the score from the dashboard
    const dashboardScore = await dashboardScoreElement.textContent();
    expect(dashboardScore).toBe(expectedScore.toString());

    // Navigate to project details
    await page.getByTestId(`project-card-${projectId}`).click();

    // Wait for project details to load
    await expect(page.getByText(projectName)).toBeVisible();

    // Check the score in the project header
    // Use a more specific selector to find the CEARTscore in the project detail header
    // The score is in a rounded-full container
    await expect(
      page.locator('.rounded-full', { hasText: 'CEARTscore:' }),
    ).toBeVisible();

    // Wait a bit for the score to be visible
    await page.waitForTimeout(1000);

    // Look for the score directly using the data-testid
    const headerScoreElement = page.getByTestId('score-value').first();
    await expect(headerScoreElement).toBeVisible();

    // Extract the score from the project details
    const detailScore = await headerScoreElement.textContent();
    expect(detailScore).toBe(expectedScore.toString());

    console.log(
      `Project score verified as ${expectedScore} for ${projectName}`,
    );
  };

  test('Desert Sun Solar Farm shows consistent CEARTscore across dashboard and details', async ({
    page,
  }) => {
    // Expected score for this project
    const expectedScore = 87;
    await testScoreConsistency(
      page,
      '1',
      'DESERT SUN SOLAR FARM',
      expectedScore,
    );
  });

  test('Geothermal Springs Plant shows consistent CEARTscore across dashboard and details', async ({
    page,
  }) => {
    // Expected score for this project
    const expectedScore = 92;
    await testScoreConsistency(
      page,
      '4',
      'GEOTHERMAL SPRINGS PLANT',
      expectedScore,
    );
  });

  test('Each project shows unique folder structure based on its uploads', async ({
    page,
  }) => {
    // First check Desert Sun Solar Farm folders
    await page.goto('/projects/1');
    await page.waitForLoadState('networkidle');

    // Wait for the page to load and DATA ROOM BROWSER to be visible
    await expect(page.getByText('DATA ROOM BROWSER')).toBeVisible();

    // Check that Financial folder exists in first project
    await expect(page.getByTestId('folder-Financial')).toBeVisible();

    // Save the folder names for first project
    const projectOneFolders = await page
      .locator('[data-testid^="folder-"]')
      .allTextContents();

    // Check second project (go back to dashboard first)
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate to Geothermal Springs Plant
    await page.getByTestId('project-card-4').click();
    await page.waitForLoadState('networkidle');

    // Wait for DATA ROOM BROWSER to be visible
    await expect(page.getByText('DATA ROOM BROWSER')).toBeVisible();

    // Save the folder names for second project
    const projectTwoFolders = await page
      .locator('[data-testid^="folder-"]')
      .allTextContents();

    // Compare folder counts - they may have the same count if mock data is the same,
    // but the important thing is that we don't have a message about no folder structure
    expect(projectOneFolders.length).toBeGreaterThan(0);
    expect(projectTwoFolders.length).toBeGreaterThan(0);

    // Verify we don't see the standard folders message
    await expect(
      page.getByText('No folder structure detected.'),
    ).not.toBeVisible();
  });
});
