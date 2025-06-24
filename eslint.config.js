import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ['dist/', 'node_modules/'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
      },
    },
    settings: {
      'import/resolver': {
        alias: {
          map: [['@', path.resolve(__dirname, 'src')]],
          extensions: ['.ts', '.js', '.tsx', '.jsx'],
        },
      },
    },
    rules: {
      // Add custom rules here
    },
  },
]; 