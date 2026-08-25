// src/__tests__/setup.js
process.env.JWT_SECRET = 'test-secret-key-12345';
process.env.NODE_ENV = 'test';

// Mute console.log and console.error during tests to keep output clean, unless you want to see them
// global.console = {
//   ...console,
//   log: jest.fn(),
//   error: jest.fn(),
//   warn: jest.fn(),
// };
