/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  transform: {
    '^.+\\.tsx?$': 'esbuild-jest',
  },
  preset: 'ts-jest',
  testEnvironment: 'node',
};
