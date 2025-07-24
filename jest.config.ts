export default {
  testPathIgnorePatterns: ['/node_modules/', '/test/e2e/'],
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['src/**/*.(t|j)s'],
  coverageDirectory: 'coverage',
  testEnvironment: 'node',

  moduleNameMapper: {
    '^@lib/common/(.*)$': '<rootDir>/libs/common/src/$1',
    '^@lib/common$': '<rootDir>/libs/common/src',
  },
};
