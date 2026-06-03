# @swift/db

Prisma schema (Prisma ORM 7), сгенерированный клиент и доступ к базе данных.

## Что внутри

- `prisma/schema.prisma` — модели User, Workspace, Member (+ enum Role)
- `prisma/seed.ts` — тестовые данные
- `prisma.config.ts` — конфиг Prisma CLI (схема, миграции, seed, url)
- `src/index.ts` — Prisma Client (синглтон + driver adapter pg) + реэкспорт типов
- `src/generated/` — сгенерированный клиент (в .gitignore, не коммитится)

## Особенности Prisma 7

- Генератор `prisma-client` (rust-free), клиент генерируется в `src/generated/prisma`
- Подключение к Postgres через driver adapter `@prisma/adapter-pg`
- Клиент генерируется автоматически через `postinstall` при `bun install`
- Seed НЕ запускается автоматически после миграций — только явной командой

## Использование в приложениях

```ts
import { prisma, Role, type User } from '@swift/db';

const user = await prisma.user.findUnique({ where: { email } });
```

Импортируй из `@swift/db`, не из сгенерированной папки напрямую.

## Команды

```bash
bun run db:generate        # сгенерировать клиент из схемы
bun run db:migrate         # создать и применить миграцию (dev)
bun run db:migrate:deploy  # применить миграции (prod/CI)
bun run db:seed            # наполнить тестовыми данными
bun run db:studio          # GUI для базы
bun run db:reset           # сбросить базу и применить миграции заново
```

## Первый запуск

База должна быть поднята через Docker Compose (postgres на localhost:5432),
DATABASE_URL в .env.

```bash
# 1. Поднять Postgres (из корня репо)
docker compose up -d

# 2. Сгенерировать клиент (или просто bun install — postinstall сделает сам)
bun run db:generate

# 3. Создать первую миграцию (имя: init)
bun run db:migrate

# 4. ВАЖНО (Prisma 7): migrate НЕ генерирует клиент автоматически.
#    Если меняешь схему — после миграции генерируй клиент явно:
bun run db:generate

# 5. Наполнить тестовыми данными
bun run db:seed

# 6. Открыть Studio
bun run db:studio
```
