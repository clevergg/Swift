# @swift/api

NestJS backend для Swift CRM.

## Стек
- NestJS 10 на Express
- Pino — структурное логирование
- Swagger — автодокументация (/api/docs)
- Валидация через Zod (кастомная ZodValidationPipe) + @swift/types
- Prisma через @swift/db

## Структура
```
src/
├── main.ts              # точка входа (bootstrap)
├── app.module.ts        # корневой модуль
├── config/
│   └── env.validation.ts # проверка переменных окружения через Zod
├── common/
│   ├── pipes/
│   │   └── zod-validation.pipe.ts  # валидация запросов Zod-схемами
│   └── filters/
│       └── all-exceptions.filter.ts # единый формат ошибок
└── modules/
    └── health/          # эндпоинт /api/health
```

## Запуск
```bash
# база должна быть поднята (docker compose up -d из корня)
bun run dev:api          # из корня монорепо
# или из папки пакета:
bun run dev
```

После запуска:
- API: http://localhost:3001/api
- Health: http://localhost:3001/api/health
- Swagger: http://localhost:3001/api/docs

## Команды
```bash
bun run dev        # запуск с авто-перезагрузкой
bun run build      # сборка
bun run lint       # линтер
bun run typecheck  # проверка типов
```

## Принципы
- Контроллеры тонкие (приём запроса), логика в сервисах
- Каждая фича — отдельный модуль в modules/
- Валидация входа через Zod-схемы из @swift/types (единый источник истины)
- Ошибки в едином формате: { code, message, details?, path, timestamp }
