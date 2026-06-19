import { defineConfig, globalIgnores } from 'eslint/config';

import globals from 'globals';
import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import tsEslint from 'typescript-eslint';
import perfectionist from 'eslint-plugin-perfectionist';
import reactHooks from 'eslint-plugin-react-hooks';
import switchCase from 'eslint-plugin-switch-case';
import unusedImports from 'eslint-plugin-unused-imports';
import eslintConfigPrettier from 'eslint-config-prettier/flat';

const plugins = {
  'react-hooks': reactHooks,
  '@stylistic': stylistic,
  js,
  perfectionist,
  'switch-case': switchCase,
  'unused-imports': unusedImports,
};

const rules = {
  '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
  '@typescript-eslint/consistent-type-imports': 'error',
  '@typescript-eslint/no-deprecated': 'error',
  'arrow-body-style': ['error', 'always'],
  curly: 'error',
  'no-undef': 'off',
  'no-useless-rename': 'error',
  'object-shorthand': 'error',
  'switch-case/no-case-curly': 'off',
  'unused-imports/no-unused-imports': 'error',

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

  'react-hooks/exhaustive-deps': 'error',

  'switch-case/newline-between-switch-case': [
    'error',
    'always',
    { fallthrough: 'never' },
  ],
};

export default defineConfig(
  [
    globalIgnores(['**/dist/', 'tests/coverage', '.yarn/releases']),
    {
      extends: [
        js.configs.recommended,
        tsEslint.configs.recommended,
        switchCase.configs.recommended,
      ],
      files: ['*.{ts}', 'src/**/*.{ts,tsx}', 'tests/*.ts'],
      languageOptions: {
        parserOptions: {
          projectService: true,
          tsconfigRootDir: import.meta.dirname,
        },
      },
      plugins,
      rules,
    },
    {
      extends: [
        js.configs.recommended,
        tsEslint.configs.recommended,
        switchCase.configs.recommended,
      ],
      files: ['*.{js}', 'scripts/*.js'],
      languageOptions: {
        globals: {
          ...globals.node,
        },
      },
    },
  ],
  eslintConfigPrettier
);
