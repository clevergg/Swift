import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

import base from './base.js';

/**
 * ESLint config для React-кода (используется в nextjs.js и mobile).
 * Расширяет базовый конфиг правилами React и Hooks.
 */
export default [
  ...base,
  {
    files: ['**/*.{jsx,tsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,

      // С React 17+ не нужен import React в каждом файле
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off', // у нас TypeScript, prop-types не нужны

      // Хуки — критичные правила, делаем error
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];
