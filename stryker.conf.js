module.exports = {
  packageManager: 'yarn',
  reporters: ['html', 'clear-text', 'progress'],
  testRunner: 'jest',
  coverageAnalysis: 'perTest',
  jest: {
    projectType: 'custom',
    configFile: 'jest.config.js',
    config: {
      testMatch: [
        '**/__tests__/**/*.[jt]s?(x)',
        '**/?(*.)+(spec|test).[jt]s?(x)',
      ],
    },
    enableFindRelatedTests: true,
  },
  checkers: ['typescript'],
  tsconfigFile: 'tsconfig.json',
  concurrency: 4,
  ignoreStatic: true,
  ignorePatterns: ['node_modules/**/*', '.next/**/*'],
  thresholds: { high: 80, low: 60, break: 40 },
  mutate: [
    // Utility functions
    'src/utils/token-validation.ts',
    'src/utils/api-auth.ts',

    // Services
    'src/services/api/apiClient.ts',

    // Core components
    'src/components/common/TokenGate.tsx',
    'src/components/common/SearchBar.tsx',

    // Project dashboard components
    'src/components/project-dashboard/ProjectCard.tsx',
    'src/components/project-dashboard/ProjectList.tsx',
    'src/components/project-dashboard/ProjectsDashboard.tsx',

    // Project detail components
    'src/components/project-detail/FileList.tsx',
    'src/components/project-detail/FileUpload.tsx',
    'src/components/project-detail/FolderBrowser.tsx',
    'src/components/project-detail/ProjectDetail.tsx',
    'src/components/project-detail/ProjectHeader.tsx',
    'src/components/project-detail/RedFlagDetails.tsx',
    'src/components/project-detail/ScoreOverview.tsx',
  ],
};
