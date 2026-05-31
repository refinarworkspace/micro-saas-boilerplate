import type { Config } from 'jest';
import nextJest from 'next/jest.js';

// Provide the path to your Next.js app so next/jest can load next.config and .env
const createJestConfig = nextJest({ dir: './' });

const config: Config = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: ['<rootDir>/__tests__/**/*.test.{ts,tsx}'],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/e2e/',
    '<rootDir>/static-boilerplate/',
  ],
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    '!**/*.d.ts',
  ],
};

// createJestConfig is exported this way to ensure next/jest can load the
// Next.js config (which is async) before Jest runs.
export default createJestConfig(config);
