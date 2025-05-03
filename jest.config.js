// jest.config.js
const nextJest = require('next/jest')({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  preset: 'ts-jest', // Use ts-jest preset
  moduleNameMapper: {
    // Handle module aliases (adjust if necessary)
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Add this transform config
  transform: {
    // Use ts-jest for ts/tsx files
    '^.+\\.(ts|tsx)$': ['ts-jest', {
        tsconfig: 'tsconfig.jest.json', // Optional: Use a separate tsconfig for tests
      }],
    // Use babel-jest for js/jsx files (if needed, Next.js might handle this)
    // '^.+\\.(js|jsx)$': 'babel-jest',
  },
  // Prevent errors from CSS/Module imports if not handled by Next.js preset
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy', // Mock CSS Modules
  },
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = nextJest(customJestConfig); 