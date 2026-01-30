module.exports = {
  // Define o preset para TypeScript
  preset: 'ts-jest',

  // Define o ambiente de teste (Node.js)
  testEnvironment: 'node',

  // Transforma também uuid (ESM) para evitar erro de syntax no Jest CJS
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  transformIgnorePatterns: ['/node_modules/(?!(uuid)/)'],

  // Setup para mocks globais (ex.: uuid)
  setupFiles: ['<rootDir>/tests/setup/jest.setup.ts'],

  // Padrões para encontrar arquivos de teste
  testMatch: [
    '**/tests/**/*.test.ts',
    '**/tests/**/*.spec.ts',
    '**/__tests__/**/*.ts',
  ],

  // Diretórios a serem ignorados
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/build/'],

  // Cobertura de código
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/backend/server.ts',
  ],

  // Mapear caminhos de módulos (se necessário)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Configurações do ts-jest
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
};
