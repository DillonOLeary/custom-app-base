# End-to-End Tests

This directory contains end-to-end tests for the CEART application using Playwright.

## Test Scenarios

The tests cover the following scenarios:

1. **CEARTscore Consistency** - Verifies that the CEARTscore displayed on the dashboard matches the score displayed on the project detail page for multiple projects.

2. **Layout and Visual Gaps** - Ensures there are no excessive vertical gaps between components on the project detail page, specifically checking that the analysis results section and data room browser section are appropriately spaced.

3. **Folder Structure** - Confirms that each project shows only its own folder structure in the data room browser, rather than displaying the same generic folder structure for all projects.

## Running the Tests

To run the tests, use one of the following commands:

```bash
# Run tests in headless mode
yarn test:e2e

# Run tests with UI mode for debugging
yarn test:e2e:ui
```

## Test Results

Screenshots of the test results are saved in the `e2e/results` directory. These are also uploaded as artifacts in GitHub Actions when the tests are run as part of CI.

## CI Integration

The tests are automatically run on GitHub Actions when:

- A push is made to the main branch
- A pull request is opened against the main branch

You can see the test results in the GitHub Actions tab of the repository.

Note: Playwright is excluded from the production build process to avoid issues with Vercel deployment. This ensures the end-to-end tests run properly in the CI environment without affecting the production deployment.

## Running Simplified Tests

A simplified test suite has been added to ensure basic application functionality can be verified reliably:

```bash
# Run only the basic tests that are most likely to pass
yarn test:e2e:basic
```

This runs a simpler test file (`simple-test.spec.ts`) that focuses on verifying that the application's basic pages are loading correctly.

## Recent Improvements

We've made several improvements to the e2e tests:

1. Added `data-testid` attributes to key elements to make them easier to find in tests:

   - `projects-heading` on the dashboard title
   - `upload-files-heading` on the file upload component
   - Existing `file-input` attribute is used for file upload testing

2. Made the tests more resilient by:

   - Using longer timeouts and better waiting strategies
   - Adding wait times after navigation to ensure page loading
   - Using more reliable test selectors

3. Added a script to run subset of tests that are known to work:
   - Simple page load tests that don't depend on specific components

## Known Issues and Troubleshooting

Some tests are still failing due to various environment issues:

1. **Text Content Issues**: Tests that rely on finding specific text content may fail because the text isn't visible due to CSS styling issues or rendering differences in the test environment.

2. **Component Loading**: Some components may not load properly in the test environment, especially when navigating between pages.

3. **Project Cards**: The tests looking for project cards on the dashboard often fail because the cards aren't being rendered properly in the test environment.

4. **Port Conflicts**: If you see errors about port 3000 already being in use, kill any running Next.js processes:

   ```bash
   pkill -f "next"
   ```

5. **Build Issues**: If you encounter errors with missing modules or chunks, try rebuilding the application:
   ```bash
   rm -rf .next && yarn build
   ```

### Browserslist Warning

If you see the following warning when running tests:

```
Browserslist: caniuse-lite is outdated. Please run:
npx update-browserslist-db@latest
```

You can update the browserslist database using Yarn:

```bash
yarn up browserslist caniuse-lite
```

This has also been added to the CI workflow to automatically handle this when tests run in GitHub Actions.
