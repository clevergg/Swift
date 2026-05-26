import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';
import prettier from 'eslint-config-prettier';

/**
 * Базовый ESLint flat config для всех пакетов монорепо.
 *
 * Flat config (ESLint 9+) — это массив объектов-конфигураций, которые
 * применяются по очереди. Пришёл на смену .eslintrc с его наследованием.
 *
 * Использование в пакете:
 *   import base from '@swift/config/eslint/base';
 *   export default base;
 */
export default tseslint.config(
  // 1. Рекомендованные правила ESLint для JS
  js.configs.recommended,

  // 2. Рекомендованные правила для TypeScript (с проверкой типов)
  ...tseslint.configs.recommended,

  // 3. Наши кастомные правила
  {
    plugins: {
      import: importPlugin,
      'unused-imports': unusedImports,
    },
    rules: {
      // ── Неиспользуемые импорты ──
      // Отключаем стандартное правило в пользу плагина, который умеет автофиксить
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',      // _unused — игнорировать
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      // ── Порядок импортов ──
      // Группируем: встроенные → внешние → внутренние → относительные
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling', 'index'],
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
          pathGroups: [
            {
              pattern: '@swift/**',
              group: 'internal',
              position: 'before',
            },
          ],
        },
      ],

      // ── TypeScript строгость ──
      // Запрещаем any, но разрешаем с явным комментарием через eslint-disable
      '@typescript-eslint/no-explicit-any': 'warn',
      // Заставляем использовать import type для типов
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      // Не разрешаем неиспользуемые await (частый баг)
      '@typescript-eslint/await-thenable': 'off', // требует type-checking, включим точечно
    },
  },

  // 4. Prettier — отключает все правила форматирования ESLint
  //    (форматирование делает Prettier, ESLint только ловит логические ошибки)
  prettier,

  // 5. Глобальные игнорируемые пути
  {
    ignores: [
      '**/dist/**',
      '**/.next/**',
      '**/.turbo/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/*.config.js',
      '**/*.config.mjs',
    ],
  },
);
