module.exports = {
  packageManager: 'yarn',
  reporters: ['html', 'clear-text', 'progress'],
  testRunner: 'jest',
  coverageAnalysis: 'perTest',
  jest: {
    projectType: 'custom',
    configFile: 'jest.config.js',
    enableFindRelatedTests: true,
  },
  checkers: ['typescript'],
  tsconfigFile: 'tsconfig.json',
  concurrency: 4,
  ignoreStatic: true,
  ignorePatterns: [
    '**/*.spec.ts',
    '**/*.test.ts',
    '**/*.test.tsx',
    'node_modules/**/*',
    '.next/**/*',
  ],
  thresholds: { high: 80, low: 60, break: 50 },
  mutate: [
    'src/utils/**/*.ts',
    'src/services/**/*.ts',
    '\!src/**/*.d.ts',
    '\!src/**/__tests__/**/*',
  ],
};
