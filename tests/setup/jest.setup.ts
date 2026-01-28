// Mock uuid to avoid ESM parsing issues in Jest CJS environment
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid'),
}));
