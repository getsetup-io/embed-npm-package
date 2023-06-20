/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    // We need to do this because jest is stupid and tries to import the .html file.
    // TypeScript imports the correct thing (the .html.ts file).
    // eslint-disable-next-line prettier/prettier
    '^.*error\.html$': '<rootDir>/src/error.html.ts',
  },
  setupFiles: ['./setupJest.js'],
}
