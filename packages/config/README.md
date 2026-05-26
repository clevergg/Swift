# @swift/config

Shared конфигурации для всего монорепо: ESLint, TypeScript, Tailwind, Prettier.

## Зачем

Вместо того чтобы копировать `.eslintrc`, `tsconfig.json`, `tailwind.config` в каждое приложение, мы держим их в одном месте и переиспользуем. Изменил правило здесь — оно применилось везде.

## Использование

### TypeScript

В `tsconfig.json` приложения:

```jsonc
// Для библиотеки (packages/*)
{ "extends": "@swift/config/typescript/library" }

// Для Next.js
{ "extends": "@swift/config/typescript/nextjs" }

// Для NestJS
{ "extends": "@swift/config/typescript/nestjs" }
```

### ESLint (flat config, eslint.config.js)

```js
// packages/* (библиотека)
import base from '@swift/config/eslint/base';
export default base;

// Next.js приложение
import nextConfig from '@swift/config/eslint/nextjs';
export default nextConfig;

// NestJS приложение
import nestConfig from '@swift/config/eslint/nestjs';
export default nestConfig;
```

### Prettier (prettier.config.js)

```js
export { default } from '@swift/config/prettier';
```

### Tailwind (tailwind.config.ts)

```ts
import swiftPreset from '@swift/config/tailwind';

export default {
  presets: [swiftPreset],
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}', // подхватываем shared UI
  ],
};
```

## Что внутри

| Файл | Назначение |
|---|---|
| `typescript/library.json` | Строгий TS для пакетов, с declaration + composite |
| `typescript/nextjs.json` | TS для Next.js (jsx preserve, DOM lib, noEmit) |
| `typescript/nestjs.json` | TS для NestJS (декораторы, CommonJS, metadata) |
| `eslint/base.js` | Базовые правила: импорты, unused, type-imports |
| `eslint/react.js` | + React и Hooks правила |
| `eslint/nextjs.js` | React + Next-специфика |
| `eslint/nestjs.js` | Послабления для DI-паттернов Nest |
| `prettier/index.js` | Форматирование + сортировка Tailwind-классов |
| `tailwind/index.js` | Дизайн-система: brand-цвета, glass, анимации |

## Дизайн-токены (Tailwind)

- `brand-*` — небесная палитра (50–950)
- `bg-glass-*` — стеклянные поверхности (используй с `backdrop-blur`)
- `shadow-glass`, `shadow-glass-lg` — мягкие тени
- `animate-blob` — анимация фоновых blur-пятен
- `animate-fade-in` — плавное появление
- `animate-shake` — тряска (для ошибок форм)
