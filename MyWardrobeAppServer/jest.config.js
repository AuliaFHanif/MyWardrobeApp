module.exports = {
    testEnvironment: 'node',
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'controllers/**/*.js',
        'middlewares/**/*.js',
        'helpers/**/*.js',
        '!**/node_modules/**',
        '!**/coverage/**',
        '!**/tests/**'
    ],
    coverageThreshold: {
        global: {
            branches: 90,
            functions: 90,
            lines: 90,
            statements: 90
        }
    },
    testMatch: [
        '**/__tests__/**/*.js',
        '**/?(*.)+(spec|test).js'
    ],
    verbose: true,
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true
};