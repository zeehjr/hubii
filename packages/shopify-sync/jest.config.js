import hq from 'alias-hq';

export default {
  transform: {
    '^.+\\.tsx?$': [
      'esbuild-jest',
      {
        sourcemap: true,
        loaders: {
          '.spec.ts': 'tsx',
        },
      },
    ],
  },
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/types/'],

  // Resolves tsconfig paths for jest
  moduleNameMapper: hq.get('jest'),
};
