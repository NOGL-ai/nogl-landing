const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2023,
            sourceType: 'commonjs',
            globals: {
                ...globals.node,
                ...globals.browser,
            },
        },
        rules: {
            'no-unused-vars': ['warn', {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
                caughtErrors: 'none',
            }],
            'no-console': 'off',
            'no-empty': ['error', { allowEmptyCatch: true }],
            'prefer-const': 'warn',
            'no-var': 'error',
            eqeqeq: ['error', 'smart'],
        },
    },
    {
        ignores: [
            'node_modules/**',
            'storage/**',
            'apify_storage/**',
            'crawlee_storage/**',
            'dist/**',
            'coverage/**',
            'package-lock.json',
        ],
    },
];
