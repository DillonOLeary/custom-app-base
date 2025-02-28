import { test, expect, Page } from '@playwright/test';
import { injectSdkMocksToPage } from './setup/browser-mocks';
import { getStandardTestProjects } from './test-setup';

test.describe('Debug Tests', () => {
  test('Project detail page debugging', async ({ page }) => {
    // Inject SDK mocks before navigating
    await injectSdkMocksToPage(page);

    // Use standard test project
    const projects = getStandardTestProjects();
    const projectId = projects.completed.id;

    // Navigate directly to a project detail page using a known test ID
    console.log(
      `Navigating to project detail page for project ${projectId}...`,
    );
    await page.goto(`/projects/${projectId}`);

    // Wait for the page to load
    console.log('Waiting for page to load...');
    await page.waitForTimeout(2000);

    // Take a screenshot to see what's actually rendering
    console.log('Taking screenshot...');
    await page.screenshot({
      path: 'test-results/project-debug-screenshot.png',
    });

    // Log the HTML to see what's actually being rendered
    console.log('Logging HTML...');
    const html = await page.content();
    console.log('HTML length:', html.length);

    // Save HTML to a file for detailed inspection
    require('fs').writeFileSync('test-results/project-page-debug.html', html);

    // Check if file-input element exists in any form
    console.log('Checking for file-input element...');
    const fileInputCount = await page
      .locator('[data-testid="file-input"]')
      .count();
    console.log('File input count:', fileInputCount);

    // Look for element by tag
    console.log('Checking for input elements...');
    const inputCount = await page.locator('input').count();
    console.log('Input elements count:', inputCount);

    // Check visibility of major section headers
    console.log('Checking for major sections...');
    const dataBrowserVisible = await page
      .getByText('DATA ROOM BROWSER')
      .isVisible();
    console.log('DATA ROOM BROWSER visible:', dataBrowserVisible);

    // Check for project name in the header
    const projectNameVisible = await page
      .getByText(projects.completed.name)
      .isVisible();
    console.log('Project name visible:', projectNameVisible);

    // Log element count to see if page is rendered at all
    const elementCount = await page.locator('*').count();
    console.log('Total element count:', elementCount);

    // Look for any errors in the console log
    const consoleLogs: string[] = [];
    page.on('console', (msg) => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });

    // Check specific file handling elements
    console.log('Checking for file components...');
    const fileListExists = await page
      .locator('div')
      .filter({ hasText: 'PROJECT FILES' })
      .first()
      .isVisible();
    console.log('File list section exists:', fileListExists);

    // Check for file items
    const fileItems = await page.locator('[data-testid^="file-item-"]').count();
    console.log('File items count:', fileItems);

    // Log page title
    console.log('Page title:', await page.title());

    // Wait a bit longer and take another screenshot to see if content loads with delay
    await page.waitForTimeout(5000);
    await page.screenshot({
      path: 'test-results/project-debug-screenshot-delayed.png',
    });

    // Log console messages
    console.log('Console logs:', consoleLogs);

    console.log('Debug test completed');
  });

  test('Check all project pages', async ({ page }) => {
    // Inject SDK mocks before navigating
    await injectSdkMocksToPage(page);

    // Get all test projects
    const projects = getStandardTestProjects();

    // Test each project page
    for (const [key, project] of Object.entries(projects)) {
      console.log(
        `Testing project page for ${key}: ${project.name} (ID: ${project.id})`,
      );

      // Navigate to project page
      await page.goto(`/projects/${project.id}`);
      await page.waitForTimeout(2000);

      // Take a screenshot for each project
      await page.screenshot({
        path: `test-results/project-${key}-screenshot.png`,
      });

      // Basic visibility checks
      const projectNameVisible = await page
        .getByText(project.name, { exact: false })
        .isVisible();
      console.log(`Project ${key} name visible:`, projectNameVisible);

      const dataBrowserVisible = await page
        .getByText('DATA ROOM BROWSER')
        .isVisible();
      console.log(`DATA ROOM BROWSER visible for ${key}:`, dataBrowserVisible);

      // Check for specific elements - check count instead of isAttached
      const fileInputCount = await page
        .locator('[data-testid="file-input"]')
        .count();
      console.log(`File input found for ${key}:`, fileInputCount > 0);

      // Log details
      console.log(`Completed testing for project: ${key}`);
      console.log('-----------------------------------');
    }
  });
});
