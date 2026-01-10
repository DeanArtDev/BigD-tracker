/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  testRegex: 'src/.*\\.(spec|test)\\.ts$',
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
  collectCoverageFrom: ['**/*.ts'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@big-d/api-contracts$': '<rootDir>/../../libs/api-contracts/src',
    '^@big-d/api-utils$': '<rootDir>/../../libs/api-utils/src',
    '^@big-d/database$': '<rootDir>/../../libs/database/src',
    '^@big-d/exceptions$': '<rootDir>/../../libs/exeptions/src',
  },
};
