# ADR-0001: Структура монорепо на Turborepo

- **Status**: Accepted
- **Date**: 2026-05-10
- **Authors**: @team

## Context

Swift CRM состоит из трёх приложений (Next.js web, NestJS API, React Native mobile)
и нескольких shared-пакетов (типы, UI, конфиги, API client). Нужно решить,
как организовать кодовую базу: один репозиторий или несколько.

Ключевые требования:
- Shared TypeScript типы между frontend и backend (DTO, enums)
- Возможность одновременного изменения API и потребителей этого API в одном PR
- Быстрое CI с инкрементальной сборкой
- Простой процесс onboarding для новых разработчиков

## Decision

Используем **monorepo на Turborepo + Bun workspaces**.

Структура:
```
swift-crm/
├── apps/
│   ├── web/          # Next.js
│   ├── mobile/       # React Native (Expo)
│   └── api/          # NestJS
└── packages/
    ├── ui/           # Shared компоненты
    ├── types/        # Shared types (DTO + enums)
    ├── config/       # ESLint, TS, Tailwind пресеты
    ├── api-client/   # Сгенерированный SDK для API
    └── db/           # Prisma schema + Prisma Client
```

## Alternatives Considered

### Option A: Polyrepo (отдельные репозитории)
- ✅ Чёткие границы ответственности команд
- ✅ Независимые деплои
- ❌ Боль с синхронизацией типов между API и фронтом
- ❌ Сложно делать атомарные изменения, затрагивающие несколько сервисов
- ❌ Дублирование инфраструктуры (CI, ESLint конфиги)

### Option B: Nx Monorepo
- ✅ Богатая функциональность (генераторы, плагины)
- ✅ Хороший dependency graph
- ❌ Steeper learning curve
- ❌ Больше "магии", сложнее debug
- ❌ Тяжелее экосистема под наш размер команды

### Option C: Turborepo + Bun (выбрано)
- ✅ Минимум магии, явная конфигурация
- ✅ Отличная интеграция с Next.js (продукт Vercel)
- ✅ Bun быстрее npm/yarn/pnpm для install
- ✅ Remote caching из коробки
- ❌ Bun менее зрелый чем pnpm (но активно развивается)
- ❌ Меньше готовых рецептов для специфичных кейсов

## Consequences

### Положительные
- Один источник истины для типов: изменение Prisma schema → ломаются типы в `@swift/db` → ломаются импорты в API и web одновременно. TypeScript ловит несоответствия на этапе компиляции.
- Атомарные PR: можно в одном PR изменить API + фронт + типы
- Один CI workflow вместо трёх
- Переиспользование UI-компонентов между web и mobile через `@swift/ui` (с осторожностью — RN и web имеют разные примитивы)

### Отрицательные / Trade-offs
- Размер репозитория растёт быстрее
- Один сломанный билд в любом приложении блокирует CI всего монорепо (mitigation: turbo фильтрует по affected packages)
- Сложнее давать частичный доступ внешним контрибьюторам

### Нейтральные
- Нужен `bun` глобально установленный у разработчиков
- Деплой каждого приложения настраивается отдельно (Docker + workflow per app)

## References

- [Turborepo docs](https://turborepo.com/docs)
- [Monorepo Tools comparison](https://monorepo.tools/)
- [Bun workspaces](https://bun.sh/docs/install/workspaces)
