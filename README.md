# Swift CRM

> Современная CRM-платформа с канбан-доской для командного управления задачами.

[![CI](https://github.com/clevergg/Swift/actions/workflows/ci.yml/badge.svg)](https://github.com/clevergg/Swift/actions/workflows/ci.yml)
[![Maintainability](https://qlty.sh/gh/clevergg/projects/Swift/maintainability.svg)](https://qlty.sh/gh/clevergg/projects/Swift)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Демонстрация

| | |
|---|---|
| **Веб-приложение** | https://swift-web-umber.vercel.app |
| **API** | https://swift-api-pwn1.onrender.com/api |
| **Swagger (документация API)** | https://swift-api-pwn1.onrender.com/api/docs |

**Тестовый вход:** `test@gmail.com` / `test1234`

> Примечание: API развёрнут на бесплатном тарифе Render, который усыпляет сервис при простое. Первый запрос после паузы может занять ~30 секунд (сервер просыпается) — это ограничение бесплатного хостинга, на production-инфраструктуре задержки нет.

## Возможности

- Канбан-доски с drag-and-drop карточек
- Multi-tenant: рабочие пространства (workspaces), роли (Owner/Admin/Member/Viewer)
- JWT-аутентификация с refresh-токенами и восстановлением сессии
- WebSocket-шлюз для real-time синхронизации
- Glass-эффекты, blur, небесная палитра, светлая и тёмная темы

## Стек

| Слой | Технологии |
|------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, TailwindCSS, Zustand, @dnd-kit |
| Backend | NestJS, TypeScript, Pino, Socket.io |
| Database | PostgreSQL, Prisma ORM |
| Cache / токены | Redis (ioredis) |
| Monorepo | Turborepo + Bun workspaces |
| Деплой | Vercel (web), Render (API), Neon (Postgres), Upstash (Redis) |
| CI/CD | GitHub Actions |

## Архитектура

Трёхслойная архитектура в монорепозитории:

- **Клиент** — Next.js, состояние в Zustand, канбан на @dnd-kit
- **Сервер** — NestJS, модули: аутентификация, рабочие пространства, доски, real-time шлюз
- **Данные** — PostgreSQL через Prisma ORM, Redis для refresh-токенов

Ключевая особенность — общие пакеты `types` (Zod-схемы) переиспользуются фронтендом и бэкендом, что обеспечивает единую валидацию данных и согласованность контрактов.

## Структура

```
Swift/
├── apps/
│   ├── web/          # Next.js frontend
│   ├── mobile/       # React Native (запланировано)
│   └── api/          # NestJS backend
├── packages/
│   ├── ui/           # Общие компоненты
│   ├── types/        # Общие типы + Zod-схемы
│   ├── config/       # ESLint, TS, Tailwind пресеты
│   ├── api-client/   # Типизированный SDK для API
│   └── db/           # Prisma schema + клиент
├── docs/
│   └── adr/          # Architecture Decision Records
└── scripts/          # Утилиты
```

## Быстрый старт

### Требования

- [Bun](https://bun.sh/) ≥ 1.1
- [Docker](https://www.docker.com/) + Docker Compose
- Node.js ≥ 20 (для совместимости некоторых пакетов)

### Установка

```bash
# 1. Клонировать репозиторий
git clone https://github.com/clevergg/Swift.git
cd Swift

# 2. Установить зависимости
bun install

# 3. Поднять инфраструктуру (Postgres, Redis)
cp .env.example .env
docker compose up -d

# 4. Применить миграции
bun run db:migrate

# 5. Запустить в dev-режиме
bun run dev
```

После запуска:
- Web: <http://localhost:3000>
- API: <http://localhost:3001/api>
- Swagger: <http://localhost:3001/api/docs>

### Полезные команды

```bash
bun run dev              # Dev для всех приложений (turbo)
bun run dev:web          # Только web
bun run dev:api          # Только api
bun run build            # Production build
bun run lint             # ESLint
bun run typecheck        # TS проверка
bun run db:migrate       # Prisma migrations
bun run db:studio        # Prisma Studio UI
```

## Качество кода

Проект анализируется Code Climate (Qlty): **Maintainability A**, technical debt ratio 1.34%, дублирование 0.9%. Архитектурные решения задокументированы в [ADR](./docs/adr/).

## Contributing

См. [CONTRIBUTING.md](./CONTRIBUTING.md). Кратко:

1. Ветка от `dev` (`feature/<scope>-<описание>`)
2. Conventional commits (`feat(web): add card drag and drop`)
3. PR в `dev`, не в `main`
4. CI должен быть зелёным
5. Минимум один approve перед мержем

## Документация

- [Architecture Decision Records](./docs/adr/)
- [API Reference](https://swift-api-pwn1.onrender.com/api/docs)

## License

MIT
