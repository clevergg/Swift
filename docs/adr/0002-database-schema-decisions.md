# ADR-0002: Решения по схеме базы данных и выбор Prisma 7

- Status: Accepted
- Date: 2026-05-30
- Authors: @clevergg

## Context

Проектируем ядро базы данных для многопользовательской CRM: User, Workspace,
Member (членство с ролью). На этом ядре строятся канбан-доска и другие фичи.
Нужно принять решения по: версии ORM, типу идентификаторов, моделированию
связи many-to-many, стратегии удаления, индексам.

## Decision

### 0. ORM — Prisma 7 (новый prisma-client генератор)

Используем Prisma ORM 7.3 с новым генератором `prisma-client` (rust-free),
driver adapter `@prisma/adapter-pg` для Postgres, конфигом `prisma.config.ts`.
Сгенерированный клиент в `src/generated/prisma` (в .gitignore, генерируется
через postinstall).

### 1. Идентификаторы — UUID

Первичные ключи — UUID (`@default(uuid())`), нативный тип Postgres `@db.Uuid`.

### 2. Связь many-to-many — явная модель Member

User <-> Workspace через явную join-модель Member с полем role.

### 3. Удаление — hard delete с каскадами

Физическое удаление. Каскады: удаление User/Workspace удаляет Member;
удаление User НЕ каскадит на Workspace. Soft delete — точечно позже.

### 4. Индексы

Уникальные на User.email, Workspace.slug; индекс на Workspace.ownerId;
составной уникальный Member (userId, workspaceId); индекс Member.workspaceId.

## Alternatives Considered

### ORM версия

- Prisma 6 (prisma-client-js, движок на Rust): отвергнут в пользу 7 — новый
  rust-free клиент легче, быстрее, меньше зависимостей. Минус 7: свежая, часть
  экосистемы ещё догоняет; driver adapter обязателен (чуть больше настройки).
- Другие ORM (Drizzle, TypeORM): Prisma выбрана за зрелость, типобезопасность,
  удобные миграции и Studio. Drizzle легче и ближе к SQL, но Prisma даёт более
  цельный DX для нашего случая.

### Идентификаторы

- Autoincrement: угадываемы, раскрывают число записей, нельзя генерировать
  на клиенте. Отвергнут.
- CUID2: короче и URL-дружелюбнее, но менее стандартен. Отвергнут в пользу
  UUID - стандарт, нативная поддержка Postgres, знаком команде.
- UUIDv7: интереснее (временная метка устраняет фрагментацию индекса), но
  экосистема ещё не везде зрелая.

### Связь many-to-many

- Неявная связь Prisma: не позволяет хранить поле role на связи. Роль —
  атрибут членства, поэтому нужна явная модель Member.

### Удаление

- Soft delete везде: преждевременное усложнение (фильтр deletedAt в каждом
  запросе, конфликты уникальности). Вводим точечно позже (архивация досок).

## Consequences

### Положительные
- Prisma 7: лёгкий клиент, актуальный стек, хороший разговор на собесе.
- UUID: безопасные id в публичном API, генерация на клиенте.
- Явный Member: роль на связи, легко расширять (joinedAt, invitedBy).
- Hard delete + каскады: чистая база, workspace защищён через владельца.
- Точечные индексы: быстрый поиск без замедления записи.

### Отрицательные / Trade-offs
- Prisma 7 свежая - возможны шероховатости в экосистеме, driver adapter
  требует чуть больше настройки (пул соединений берётся из pg, не из Prisma).
- UUID занимает больше места, чем int; классическая версия фрагментирует
  индекс на больших объёмах. Для нашего масштаба некритично.
- Hard delete необратим. Принято осознанно; soft delete — точечно позже.

## References

- Upgrade to Prisma 7: https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7
- Prisma generators: https://www.prisma.io/docs/orm/prisma-schema/overview/generators
