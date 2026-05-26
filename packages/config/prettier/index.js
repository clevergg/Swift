/**
 * Shared Prettier конфигурация.
 *
 * Использование в корне:
 *   // prettier.config.js
 *   export { default } from '@swift/config/prettier';
 */

/** @type {import("prettier").Config} */
export default {
  // Точка с запятой в конце строк
  semi: true,
  // Одинарные кавычки (кроме JSX, где двойные — стандарт)
  singleQuote: true,
  jsxSingleQuote: false,
  // Запятая в конце многострочных структур (чище git diff)
  trailingComma: 'all',
  // Ширина строки
  printWidth: 100,
  // Отступ 2 пробела
  tabWidth: 2,
  useTabs: false,
  // Скобки вокруг единственного аргумента стрелочной функции: (x) => x
  arrowParens: 'always',
  // Перенос строк LF (не CRLF) — единообразие между OS
  endOfLine: 'lf',
  // Плагин сортировки классов Tailwind (классы упорядочиваются автоматически)
  plugins: ['prettier-plugin-tailwindcss'],
};
