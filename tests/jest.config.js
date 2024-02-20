module.exports = {
  setupFilesAfterEnv: ['<rootDir>/tests/testing-library.setup.js'],
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
    '@context': '<rootDir>/src/context',
  },
  transform: {
    '\\.[jt]sx?$': 'babel-jest',
  },
  rootDir: '../',
  preset: 'ts-jest',
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/tests/'],
  coverageDirectory: '<rootDir>/tests/coverage',
};
