module.exports = {
  cache: false,
  maxWorkers: '50%',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  passWithNoTests: true,
  preset: 'ts-jest/presets/default-esm',
  roots: ['<rootDir>'],
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.test.ts'],
};
