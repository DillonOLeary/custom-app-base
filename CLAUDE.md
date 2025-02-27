# CLAUDE.md - Build and Code Style Guidelines

## Build Commands
- `yarn dev` - Run dev server for local development (http://localhost:3000)
- `yarn dev:embedded` - Run dev server in embedded mode
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn lint` - Run ESLint

## Code Style
- **Formatting**: Single quotes, trailing commas, 80 char width (Prettier enforced)
- **TypeScript**: Strict mode enabled, use explicit types for function parameters
- **Components**: Use functional components with explicit return types
- **Imports**: Use absolute imports from `@/*` for src directory contents
- **Naming**: 
  - PascalCase for components/interfaces/types
  - camelCase for variables/functions
  - snake_case for API fields
- **Error Handling**: Use try/catch for API calls, provide meaningful error messages

## Project Structure
- `/src/app/` - Next.js app router pages/components
- `/src/components/` - Reusable UI components
- `/src/utils/` - Utility functions and helpers
- `/public/` - Static assets

This codebase is a Next.js application using the Copilot platform APIs.