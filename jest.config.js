module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  globalSetup: 'jest-preset-angular/global-setup',
  
  // Mapeo de módulos
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@core/(.*)$': '<rootDir>/src/app/core/$1',
    '^@features/(.*)$': '<rootDir>/src/app/features/$1',
    '^@shared/(.*)$': '<rootDir>/src/app/shared/$1'
  },
  
  // Archivos de test
  testMatch: [
    '**/*.spec.ts'
  ],
  
  // Cobertura
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['html', 'text-summary', 'lcov'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.d.ts',
    '!src/main.ts',
    '!src/polyfills.ts',
    '!src/environments/**',
    '!src/**/*.module.ts'
  ],
  
  // Thresholds de cobertura (70% mínimo)
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // Transformaciones
  transform: {
    '^.+\\.(ts|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.html$',
        isolatedModules: true,
        diagnostics: {
          ignoreCodes: [151001]
        }
      }
    ]
  },
  
  // Ignorar transformación de node_modules
  transformIgnorePatterns: [
    'node_modules/(?!.*\\.mjs$)'
  ],
  
  // Extensiones de archivos
  moduleFileExtensions: ['ts', 'html', 'js', 'json'],
  
  // Entorno de test
  testEnvironment: 'jsdom',
  
  // Configuración del entorno
  testEnvironmentOptions: {
    url: 'http://localhost'
  },
  
  // Limpieza
  clearMocks: true,
  restoreMocks: true,
  
  // Timeout
  testTimeout: 10000,
  
  // Verbose
  verbose: true
};
