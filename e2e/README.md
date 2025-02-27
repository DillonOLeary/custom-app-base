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

## Troubleshooting

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
