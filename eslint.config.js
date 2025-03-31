import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { fixupConfigRules, fixupPluginRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import stylisticTs from '@stylistic/eslint-plugin-ts';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import _import from 'eslint-plugin-import';
import jsxA11Y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: ['**/dist/', 'tests/coverage', '.yarn/releases/yarn-4.7.0.cjs'],
  },
  ...fixupConfigRules(
    compat.extends(
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:react/recommended',
      'plugin:react-hooks/recommended',
      'prettier'
    )
  ),
  {
    plugins: {
      '@typescript-eslint': fixupPluginRules(typescriptEslint),
      '@stylistic/ts': stylisticTs,
      react: fixupPluginRules(react),
      'react-hooks': fixupPluginRules(reactHooks),
      'jsx-a11y': jsxA11Y,
      import: fixupPluginRules(_import),
      'unused-imports': unusedImports,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
      },

      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },

    settings: {
      react: {
        version: 'detect',
      },
    },

    rules: {
      'no-undef': 'off',
      'no-useless-rename': 'error',
      'arrow-body-style': ['error', 'always'],
      curly: 'error',

      'no-console': [
        'warn',
        {
          allow: ['warn', 'error'],
        },
      ],

      'object-shorthand': 'error',
      'import/no-duplicates': 'error',
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/consistent-type-imports': 'error',

      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: 'return' },
        { blankLine: 'always', prev: '*', next: 'block-like' },
        { blankLine: 'always', prev: '*', next: 'block' },
        { blankLine: 'always', prev: 'block-like', next: '*' },
        { blankLine: 'always', prev: 'block', next: '*' },
        { blankLine: 'always', prev: '*', next: 'case' },
        { blankLine: 'never', prev: 'case', next: 'case' },
        { blankLine: 'always', prev: '*', next: 'default' },
      ],

      'import/order': [
        'error',
        {
          'newlines-between': 'always',

          alphabetize: {
            order: 'asc',
          },

          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            ['index', 'sibling'],
          ],
        },
      ],
    },
  },
];
