# CEART Testing Documentation

## Overview

This document describes the testing strategy and known issues for the CEART application.

## Test Types

The application has the following test types:

1. **Unit Tests** - Testing individual components and functions
2. **End-to-End Tests** - Testing complete user flows with Playwright

## E2E Test Improvements

We've made several improvements to ensure tests are more reliable:

### 1. Fixed JavaScript Errors in Components

Several components had null/undefined checking issues which were fixed:

- `ProjectHeader.tsx`: Added null checking for `project.name` to avoid `toUpperCase()` errors
- `FileList.tsx`: Added safety checks for `fileName` in `getFileIcon()` function
- `FolderBrowser.tsx`: Added safety checks for `fileName` in `getFileIcon()` function
- Both file components: Added null checking for `file.status` in status display code

### 2. Enhanced Test Data Quality

Improved mock data handling:

- Created `ensureProjectFields` function to ensure all project fields have valid defaults
- Created `ensureFileFields` function to ensure all file fields have valid defaults
- Updated browser-mocks.ts to use these safe field handling functions

### 3. Improved Test Debugging

Added better test debugging tools:

- Created `debug-test.spec.ts` with detailed diagnostics for project detail pages
- Added extensive logging to track render issues
- Created screenshots for visual verification

### 4. Simplified Test Approach

For basic verification:

- Added `simple-test.spec.ts` with basic page load tests
- Created `yarn test:e2e:basic` script to run reliable tests only

## Running Tests

The following test commands are available:

- `yarn test` - Run unit tests
- `yarn test:e2e` - Run all e2e tests
- `yarn test:e2e:basic` - Run only basic e2e tests (most reliable)
- `yarn test:e2e:ui` - Run e2e tests with Playwright UI for debugging

## Common Issues

1. **Project Name Display** - The tests detect that project names may not be visible, though the page otherwise renders correctly. This could be due to CSS issues or load timing.

2. **Browser vs. Test Environment** - Some tests may pass in a browser but fail in the CI environment due to differences in rendering.

3. **Element Visibility** - If elements appear to be in the DOM but aren't visible, check z-index issues or hidden elements.

## Test Strategy

1. Start with the simplest tests (`simple-test.spec.ts` and `debug-test.spec.ts`)
2. If those pass, move to more complex tests like `user-flow.spec.ts`
3. Use the `test:e2e:ui` command for detailed investigation of failures

## Future Improvements

1. Add more data-testid attributes to key elements
2. Enhance mock data to better reflect production data
3. Improve test timeouts and wait strategies
4. Consider separating tests for different project states (completed, analyzing, pending)
