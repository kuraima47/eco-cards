/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  reporters: [
    'default',
    [ 'jest-junit', {
      outputDirectory: './reports/junit',
      outputName: 'jest-results.xml',
    }]
  ],
};
