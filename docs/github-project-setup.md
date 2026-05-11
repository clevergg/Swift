# GitHub Project (Roadmap) — настройка

GitHub Project — это новый канбан/таблица/roadmap инструмент GitHub
(не путать с устаревшими Projects classic).

## Шаги создания

### 1. Создать Project

1. Открой свой профиль/организацию → вкладка **Projects** → **New project**
2. Выбери шаблон **Roadmap** (Date-based view) или **Board** для канбан-вью
3. Назови: `Swift CRM Roadmap`
4. Visibility: Private (или Public, если open-source)

### 2. Привязать к репозиторию

В настройках проекта → **Manage access** → добавь репозиторий `swift-crm`.

### 3. Настроить поля (Custom Fields)

Создай поля сверх дефолтных:

| Поле           | Тип              | Опции                                              |
|----------------|------------------|----------------------------------------------------|
| Status         | Single select    | Backlog, Ready, In Progress, In Review, Done       |
| Priority       | Single select    | P0 Critical, P1 High, P2 Medium, P3 Low            |
| Scope          | Single select    | Web, Mobile, API, DB, Infra, UI, Docs              |
| Estimate       | Number           | Story points (1, 2, 3, 5, 8, 13)                   |
| Sprint         | Iteration        | 2-week sprints                                     |
| Target release | Single select    | MVP, v1.0, v2.0                                    |

### 4. Настроить Views

#### View 1: Board (канбан)
- Layout: Board
- Group by: **Status**
- Sort by: Priority

#### View 2: Roadmap (timeline)
- Layout: Roadmap
- Date fields: Sprint start / Sprint end
- Group by: Target release или Scope

#### View 3: By milestone
- Layout: Table
- Group by: Milestone
- Filter: `is:open`

#### View 4: My tasks
- Layout: Board
- Filter: `assignee:@me is:open`

### 5. Workflow автоматизации

В Project → Settings → Workflows включить:

-  **Item added to project** → Status = Backlog
-  **Pull request merged** → Status = Done
-  **Issue closed** → Status = Done
-  **Pull request opened** → Status = In Review
-  **Issue reopened** → Status = In Progress

### 6. Подключить все issues

После запуска `scripts/setup-github.sh` и `scripts/create-issues.sh`:

```bash
# В Project → Add items → "Add items by URL or text"
# или фильтром: репозиторий swift-crm + state open
```

Все 30 issue окажутся в Backlog. Дальше:
- Расставить **Priority** и **Estimate** (planning poker)
- Распределить по **Sprint**
- Связать с **Target release** (по milestone)

### 7. Eженедельная гигиена

Раз в неделю проходить по доске:
- Triage новых issues (статус "Backlog" → "Ready" с приоритетом)
- Переоценить заблокированные задачи
- Закрыть устаревшие issues
