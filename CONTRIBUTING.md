# Contributing to Swift CRM

Спасибо, что хочешь внести вклад! Здесь описаны правила и процессы.

##  Ветки

- `main` — production. Защищена. Мерж только из `dev` через release PR.
- `dev` — основная ветка разработки. Защищена. Мерж только через PR.
- `feature/<scope>-<short-description>` — новая фича (например, `feature/api-auth-jwt`)
- `fix/<scope>-<short-description>` — багфикс
- `chore/<short-description>` — инфраструктура, конфиги
- `docs/<short-description>` — документация
- `refactor/<short-description>` — рефакторинг

##  Conventional Commits

Все коммиты должны следовать [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Типы:**
- `feat` — новая функциональность
- `fix` — багфикс
- `docs` — документация
- `style` — форматирование (без изменения кода)
- `refactor` — рефакторинг
- `perf` — улучшение производительности
- `test` — тесты
- `chore` — инфраструктура, зависимости
- `ci` — CI/CD

**Примеры:**
```
feat(api): add JWT refresh token rotation
fix(web): handle 401 race condition in interceptor
docs(adr): add ADR-005 for real-time strategy
chore(deps): bump prisma to 5.18
```

##  Pull Request flow

1. Создай branch от `dev`
2. Делай атомарные коммиты
3. Push → создай PR в `dev`
4. Заполни PR template до конца
5. Линкни связанные issue (`Closes #N`)
6. Жди review (минимум 1 approve)
7. CI должен быть зелёным
8. После approve — Squash and merge

### Размер PR

-  Хорошо: < 400 строк изменений
-  Предупреждение: 400–800 строк
-  Плохо: > 800 строк (вероятно надо разбить)

##  Тестирование

Перед PR обязательно:

```bash
bun run lint           # 0 errors
bun run typecheck      # 0 errors
bun run test           # все passed
bun run build          # успешно
```

##  Code style

- ESLint + Prettier настроены, не спорь с ними — `bun run format`
- Без `any`, кроме случаев когда без него никак (с комментарием почему)
- Imports: external → internal → relative, отсортированы автоматически
- Без `console.log` в коммитах (только Pino logger)

##  Issues

Используй шаблоны (Bug Report / Feature). Минимум labels: `type:*`, `scope:*`, `priority:*`.

##  Code Review

При ревью обращай внимание на:
- Архитектурные решения обоснованы
- Нет проблем с безопасностью (SQL injection, XSS, утечки)
- Тесты покрывают edge cases
- Производительность (N+1 запросы, лишние ре-рендеры)
- Читаемость и поддерживаемость

##  Architecture Decisions

Серьёзные архитектурные решения фиксируем в [docs/adr/](./docs/adr/).
Если делаешь нетривиальный выбор — добавь ADR в этом же PR.
