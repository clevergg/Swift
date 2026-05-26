import base from './base.js';

/**
 * ESLint config для NestJS приложения.
 * NestJS активно использует декораторы и классы, поэтому ослабляем
 * некоторые правила, которые мешают идиоматичному коду Nest.
 */
export default [
  ...base,
  {
    files: ['**/*.ts'],
    rules: {
      // NestJS DI требует пустых конструкторов с параметрами-свойствами
      '@typescript-eslint/no-useless-constructor': 'off',
      // Декораторы параметров (@Param, @Body) выглядят как unused для линтера
      '@typescript-eslint/no-unused-vars': 'off',
      // Классы-сервисы часто не имеют методов на момент создания
      '@typescript-eslint/no-extraneous-class': 'off',
      // interface merging в NestJS — норма
      '@typescript-eslint/no-empty-interface': 'off',
    },
  },
];
