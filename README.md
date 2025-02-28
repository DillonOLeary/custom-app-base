# README for Custom App Base

[![CI Pipeline](https://github.com/DillonOLeary/custom-app-base/actions/workflows/main-ci-pipeline.yml/badge.svg)](https://github.com/DillonOLeary/custom-app-base/actions/workflows/main-ci-pipeline.yml)

This repository is a starting point for [Copilot Apps](https://www.copilot.com/apps). It is built using using [Next.js](https://nextjs.org/) and was bootstrapped with [create-next-app](https://nextjs.org/docs/pages/api-reference/create-next-app).

### Benefits

Copilot Apps can be embedded in your internal dashboard and client portal and they can use our REST API to fetch information and perform actions, extending the Copilot production with custom functionality to meet a variety of needs.

### Prerequisites

In order to build a Copilot custom app you'll need a knowledge of modern web development. Here are some of the tools you'll encounter in this repository:

- Node.JS
- React
- Next.JS
- Yarn (NPM, PNPM, Bun or any other Node.JS package manager are also possible, but we use Yarn)

### Getting Started

The easiest way to get started is to fork this repo. Once forked, you will need to deploy the app and add it to Copilot.

**Deploying and Configuring App**

The easiest way to deploy this custom app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

- Create a new project in your Vercel account. Note: create an account if you don't have one using github to automatically import repos.
- Select the forked repo in Import Git Repository
- In environment variables add COPILOT_API_KEY. Your API key will be generated after you [add your app in the Copilot dashboard](https://dashboard.copilot.com/app-setup/setup?moduleType=extension&moduleId=new&preset=custom&appId=). You can submit 3 different URLs for your app: an internal URL for [internal users](https://docs.copilot.com/reference/internal-users), a client URL for [clients](https://docs.copilot.com/reference/clients), and a webhook URL that allows your app to subscribe to various [webhook events](https://docs.copilot.com/reference/webhooks-events). These values can all be edited after you create your app, so you can start with a simple config and add to it later.

### **Developing App**

All you need to do to get started developing is clone your forked app locally and run a few commands.

**Install dependencies**

```tsx
yarn install
```

**Run the app locally**

```
yarn dev
```

Open [http://localhost:3000](http://localhost:3000/) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

### Testing

**Run unit tests**

```
yarn test
```

**Run E2E tests**

```
yarn test:e2e
```

**Run mutation tests**

Mutation testing helps verify the quality of your test suite by making small changes to your code and ensuring tests catch these changes.

```
yarn test:mutation          # Run mutation tests on all configured files
yarn test:mutation:utils    # Run mutation tests only on utility functions
yarn test:mutation:services # Run mutation tests only on services
yarn test:mutation:components # Run mutation tests on all components
yarn test:mutation:common   # Run mutation tests only on common components
yarn test:mutation:dashboard # Run mutation tests only on dashboard components
yarn test:mutation:detail   # Run mutation tests only on project detail components
```

Mutation testing results are available in HTML format at `reports/mutation/mutation.html` after running the tests.

### Content Security Policy

The Content Security Policy in the custom app base should be configured in `src/middleware.ts`. In the `cspHeader` variable under `frame-ancestors`, `https://dashboard.copilot.com` and `https://*.copilot.app` are pre-configured. If you have a custom domain, you'll also want to add your custom domain here. For example, `https://portal.mycompany.com`.

### Security Model

This application implements a robust security model for authentication that differentiates between development/testing and production environments.

#### Security Features

1. **Token-based Authentication**

   - All production requests require a valid Copilot session token
   - Token validation includes expiration checks, format validation, and rate-limiting

2. **Environment-aware Validation**

   - Testing environments use mock authentication for CI compatibility
   - Production enforces strict token validation

3. **Security Enforcement**
   - The `ENFORCE_SDK_VALIDATION=true` environment variable overrides all other settings to enforce security
   - Weekly security validation in CI to ensure bypasses aren't affecting production security

#### Testing vs Production

To ensure the application remains secure while allowing convenient testing:

1. **Testing Environments** (any of the following):

   - `NODE_ENV=development` or `NODE_ENV=test`
   - `COPILOT_ENV=local`
   - `NEXT_PUBLIC_TEST_MODE=true`
   - `CI=true`

2. **Production Environment**:

   - `NODE_ENV=production`
   - No test flags enabled
   - Always requires valid tokens

3. **Security Testing**:
   - Run `./test-security.sh` to start a server with enforced security
   - Security validation runs weekly in CI

### Continuous Integration

This repository uses GitHub Actions for CI/CD with a sequential workflow pipeline:

1. **Install** - Sets up Node.js and installs dependencies
2. **Format Check** - Ensures code follows Prettier formatting guidelines
3. **Lint** - Runs ESLint to catch code quality issues and potential bugs
4. **Type Check** - Verifies TypeScript type correctness
5. **Test** - Executes unit tests with Jest
6. **Build** - Builds the Next.js application for production
7. **E2E Test** - Runs end-to-end tests with Playwright
8. **Security Test** - Weekly validation of security mechanisms

### Local Development

For local development, you'll need a valid COPILOT_API_KEY in your `.env.local` file.

```
COPILOT_API_KEY=sk_...
```

### Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
