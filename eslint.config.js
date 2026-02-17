import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { fixupConfigRules, fixupPluginRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import jsxA11Y from 'eslint-plugin-jsx-a11y';
import perfectionist from 'eslint-plugin-perfectionist';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import switchCase from 'eslint-plugin-switch-case';
import unusedImports from 'eslint-plugin-unused-imports';

import globals from 'globals';

const compat = new FlatCompat({
  baseDirectory: path.dirname(fileURLToPath(import.meta.url)),
  recommendedConfig: js.configs.recommended,
});

export default [
  {
    ignores: ['**/dist/', 'tests/coverage', '.yarn/releases'],
  },
  ...fixupConfigRules(
    compat.extends(
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:react/recommended',
      'plugin:react-hooks/recommended',
      'plugin:switch-case/recommended',
      'prettier'
    )
  ),
  {
    languageOptions: {
      ecmaVersion: 'latest',
      parser: tsParser,
      sourceType: 'module',

      globals: {
        ...globals.browser,
      },

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    plugins: {
      '@stylistic': stylistic,
      '@typescript-eslint': fixupPluginRules(typescriptEslint),
      import: importPlugin,
      'jsx-a11y': jsxA11Y,
      perfectionist,
      react: fixupPluginRules(react),
      'react-hooks': fixupPluginRules(reactHooks),
      'switch-case': fixupPluginRules(switchCase),
      'unused-imports': unusedImports,
    },

    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      'arrow-body-style': ['error', 'always'],
      curly: 'error',
      'import/no-duplicates': 'error',
      'import/order': 'off',
      'no-undef': 'off',
      'no-useless-rename': 'error',
      'object-shorthand': 'error',
      'react/react-in-jsx-scope': 'off',
      'switch-case/no-case-curly': 'off',

      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      'no-console': [
        'warn',
        {
          allow: ['warn', 'error'],
        },
      ],

      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', next: 'return', prev: '*' },
        { blankLine: 'always', next: 'block-like', prev: '*' },
        { blankLine: 'always', next: 'block', prev: '*' },
        { blankLine: 'always', next: '*', prev: 'block-like' },
        { blankLine: 'always', next: '*', prev: 'block' },
      ],

      'perfectionist/sort-exports': [
        'error',
        {
          ignoreCase: true,
          order: 'asc',
          type: 'alphabetical',
        },
      ],

      'perfectionist/sort-imports': [
        'error',
        {
          ignoreCase: true,
          newlinesBetween: 1,
          order: 'asc',
          tsconfig: { rootDir: '.' },
          type: 'alphabetical',
          groups: [
            'builtin',
            { newlinesBetween: 1 },
            'external',
            { newlinesBetween: 1 },
            'internal',
            { newlinesBetween: 1 },
            'parent',
            { newlinesBetween: 1 },
            ['index', 'sibling'],
          ],
        },
      ],

      'perfectionist/sort-jsx-props': [
        'error',
        {
          type: 'line-length',
        },
      ],

      'perfectionist/sort-named-imports': [
        'error',
        {
          type: 'line-length',
        },
      ],

      'perfectionist/sort-object-types': [
        'error',
        {
          groups: ['unknown', 'method', 'multiline-member'],
        },
      ],

      'perfectionist/sort-objects': [
        'error',
        {
          groups: ['unknown', 'method', 'multiline-member'],
        },
      ],

      'react/boolean-prop-naming': [
        'error',
        { propTypeNames: ['bool', 'mutuallyExclusiveTrueProps'] },
      ],

      'switch-case/newline-between-switch-case': [
        'error',
        'always',
        { fallthrough: 'never' },
      ],
    },

    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];
