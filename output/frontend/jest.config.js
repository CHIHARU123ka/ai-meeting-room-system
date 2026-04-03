/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests', '<rootDir>/src'],
  testMatch: ['**/tests/**/*.test.ts', '**/tests/**/*.test.tsx', '**/*.test.ts', '**/*.test.tsx'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
    '^@/styles/(.*)$': '<rootDir>/src/styles/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/lib/hooks/$1',
    '^@/stores/(.*)$': '<rootDir>/src/lib/stores/$1',
    '^@/utils/(.*)$': '<rootDir>/src/lib/utils/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      jsx: 'react-jsx',
    }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};
