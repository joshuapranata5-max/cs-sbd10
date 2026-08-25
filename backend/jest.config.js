module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.js'],
  clearMocks: true,
  coverageDirectory: 'coverage',
  testPathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/src/__tests__/setup.js'
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/config/**',
    '!src/database/**',
    '!src/__tests__/**'
  ]
};
