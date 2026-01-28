process.env.JWT_SECRET = 'test-secret-key-123';
process.env.DB_SOURCE = ':memory:';

// Mock uuid to avoid ESM parsing issues in Jest CJS environment
jest.mock('uuid', () => ({
  v4: jest.fn(() => `test-uuid-${Date.now()}-${Math.floor(Math.random() * 100000)}`),
}));
