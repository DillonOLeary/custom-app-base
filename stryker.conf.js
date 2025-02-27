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
  thresholds: { high: 80, low: 60, break: 50 },
  mutate: ['src/utils/api-auth.ts'],
};
