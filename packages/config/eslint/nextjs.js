import react from './react.js';

/**
 * ESLint config для Next.js приложения.
 *
 * Примечание: eslint-config-next подключается отдельно в самом приложении
 * через FlatCompat, т.к. на момент написания next/core-web-vitals ещё не
 * полностью мигрировал на flat config. В apps/web будет:
 *
 *   import nextConfig from '@swift/config/eslint/nextjs';
 *   import { FlatCompat } from '@eslint/eslintrc';
 *   const compat = new FlatCompat();
 *   export default [
 *     ...nextConfig,
 *     ...compat.extends('next/core-web-vitals'),
 *   ];
 */
export default [
  ...react,
  {
    rules: {
      // Next.js-специфичные послабления можно добавить здесь
    },
  },
];
