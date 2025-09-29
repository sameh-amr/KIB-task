import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/test/**/*.spec.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: { '^.+\\.ts$': 'ts-jest' },
  // If you use TS path aliases later, add a moduleNameMapper here.
  collectCoverageFrom: ['<rootDir>/src/**/*.ts', '!<rootDir>/src/main.ts'],
  coverageDirectory: '<rootDir>/coverage/unit',
  // Use our test tsconfig:
  globals: {
    'ts-jest': { tsconfig: '<rootDir>/tsconfig.spec.json' }
  }
};
export default config;
