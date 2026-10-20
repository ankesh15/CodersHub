import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
export default [
  { ignores: ['dist/**', 'node_modules/**', 'test-results/**', 'playwright-report/**'] },
  js.configs.recommended,
  { files: ['**/*.{js,jsx}'], languageOptions: { globals: { ...globals.browser, ...globals.node }, parserOptions: { ecmaFeatures: { jsx: true } } },
    plugins: { react }, settings: { react: { version: 'detect' } }, rules: { 'react/jsx-uses-react': 'error', 'react/jsx-uses-vars': 'error', 'react/no-unknown-property': 'error', 'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrors: 'none' }] } },
];
