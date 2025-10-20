export default {
  displayName: 'integration-tests',
  preset: '../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/test-setup.ts'],
  coverageDirectory: '../coverage/integration-tests',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.json',
    }],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testMatch: ['<rootDir>/**/*.integration.test.{ts,tsx}'],
  moduleNameMapper: {
    '^@ai-product-dashboard/shared-types$': '<rootDir>/../shared-types/src/index.ts',
    '^@ai-product-dashboard/shared-api$': '<rootDir>/../shared-api/src/index.ts',
  },
};