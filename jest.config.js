export default {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  moduleNameMapper: {
    '\\.(css|scss)$': 'identity-obj-proxy'
  },
  testMatch: ['<rootDir>/src/**/*.test.{js,jsx}'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js']
};
