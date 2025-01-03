export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.js'],
  verbose: true,
  roots: ['<rootDir>'],
  modulePaths: ['<rootDir>'],
  moduleDirectories: ['node_modules'],
  moduleNameMapper: {
    '@hooks': '<rootDir>/src/hooks',
    '@services': '<rootDir>/src/services',
    '@components': '<rootDir>/src/components',
    '@utils': '<rootDir>/src/utils',
    '@helpers': '<rootDir>/src/helpers',
    '@models': '<rootDir>/src/models',
    '@stores': '<rootDir>/src/stores',
    '@tests': '<rootDir>/tests',
    '@root/tailwind.config': '<rootDir>/tailwind.config.ts',
  },
  transform: {
    '\\.[jt]sx?$': 'babel-jest',
  },
  rootDir: '../',
  preset: 'ts-jest',
  coveragePathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/tests/'],
  coverageDirectory: '<rootDir>/tests/coverage',
};
