# Swift CRM

> Современная CRM-платформа с канбан-доской, real-time синхронизацией и аналитикой.

[![CI](https://github.com/<your-org>/swift-crm/actions/workflows/ci.yml/badge.svg)](https://github.com/<your-org>/swift-crm/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

##  Возможности

- Канбан-доски с drag-and-drop
- Multi-tenant: workspace, команды, роли (Owner/Admin/Member/Viewer)
- Real-time синхронизация через WebSocket
- Аналитика и метрики команд
- Уведомления (in-app + email)
- Web + Mobile (React Native)
- Glass-эффекты, blur, небесная палитра

##  Стек

| Слой       | Технологии                                          |
|------------|-----------------------------------------------------|
| Frontend   | Next.js 15 (App Router), TypeScript, Tailwind, Zustand, TanStack Query |
| Mobile     | React Native (Expo), NativeWind                     |
| Backend    | NestJS, TypeScript, Pino, Socket.io                 |
| Database   | PostgreSQL 16, Prisma ORM                           |
| Cache/PubSub | Redis 7                                           |
| Storage    | S3-compatible (MinIO в dev)                         |
| Monorepo   | Turborepo + Bun                                     |
| CI/CD      | GitHub Actions                                      |

## Структура

```
swift-crm/
├── apps/
│   ├── web/          # Next.js frontend
│   ├── mobile/       # React Native (Expo)
│   └── api/          # NestJS backend
├── packages/
│   ├── ui/           # Shared компоненты
│   ├── types/        # Shared TypeScript типы
│   ├── config/       # ESLint, TS, Tailwind пресеты
│   ├── api-client/   # Типизированный SDK для API
│   └── db/           # Prisma schema + клиент
├── docs/
│   └── adr/          # Architecture Decision Records
└── scripts/          # Утилиты (setup, миграции, etc)
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

# 3. Поднять инфраструктуру (Postgres, Redis, MinIO)
cp .env.example .env
docker compose up -d

# 4. Применить миграции и seed
bun run db:migrate
bun run db:seed

# 5. Запустить всё в dev-режиме
bun run dev
```

После запуска:
- Web: <http://localhost:3000>
- API: <http://localhost:3001>
- Swagger: <http://localhost:3001/api/docs>
- MinIO: <http://localhost:9001>

### Полезные команды

```bash
bun run dev              # Dev для всех приложений (turbo)
bun run dev:web          # Только web
bun run dev:api          # Только api
bun run build            # Production build
bun run lint             # ESLint
bun run typecheck        # TS проверка
bun run test             # Unit + integration
bun run e2e              # Playwright e2e
bun run db:migrate       # Prisma migrations
bun run db:studio        # Prisma Studio UI
```

## Contributing

См. [CONTRIBUTING.md](./CONTRIBUTING.md). Кратко:

1. Fork → branch (`feat/...`, `fix/...`)
2. Conventional commits (`feat: add card drag and drop`)
3. PR в `dev`, не в `main`
4. CI должен быть зелёным
5. Минимум один approve перед мержем

## Документация

- [Architecture Decision Records](./docs/adr/)
- [API Reference](http://localhost:3001/api/docs) (после запуска)

## License

MIT
