#  Quickstart — как применить эту настройку

Этот файл — пошаговая инструкция как поднять GitHub-инфраструктуру проекта.
Один раз пройдись по нему — потом удали или замени на нормальный README.

## Шаг 1: Создай репозиторий на GitHub

```bash
# Создать пустой репозиторий через gh CLI
gh repo create swift-crm --private --source=. --remote=origin

# Или вручную через веб → клонировать → переместить эти файлы
```

## Шаг 2: Настрой git-репозиторий

```bash
git init
git add .
git commit -m "chore: initial monorepo setup"
git branch -M main
git push -u origin main

# Создать ветку dev
git checkout -b dev
git push -u origin dev
```

## Шаг 3: Замени плейсхолдеры

Перед запуском скриптов отредактируй:

- [ ] `.github/CODEOWNERS` — замени `<your-username>` на твой ник
- [ ] `.github/ISSUE_TEMPLATE/config.yml` — замени `<your-org>` на свой owner
- [ ] `README.md` — замени `<your-org>` в бэйджах
- [ ] Даты в `scripts/setup-github.sh` — поставь свои сроки для milestones

## Шаг 4: Установи gh CLI и jq

```bash
# macOS
brew install gh jq

# Linux (Debian/Ubuntu)
sudo apt install gh jq

# Авторизация в gh
gh auth login
```

## Шаг 5: Запусти setup labels + milestones

```bash
chmod +x scripts/setup-github.sh
bash scripts/setup-github.sh
```

Должно создаться **27 labels** и **3 milestones** (MVP, v1.0, v2.0).

## Шаг 6: Создай все issues

```bash
chmod +x scripts/create-issues.sh
bash scripts/create-issues.sh
```

Это создаст **30 детальных issues**, распределённых по milestones.

## Шаг 7: Настрой Branch Protection

В GitHub → Settings → Branches → Add rule:

**Для `main`:**
-  Require a pull request before merging
-  Require approvals (1)
-  Require status checks to pass: `lint-and-typecheck`, `test`, `build`
-  Require branches to be up to date
-  Require conversation resolution
-  Do not allow bypassing

**Для `dev`:**
- То же, кроме approvals можно сделать 0 для соло-разработки

## Шаг 8: Создай GitHub Project (Roadmap)

См. `docs/github-project-setup.md` — там пошагово.

## Шаг 9: Настрой автомерж и labels-bot (опционально)

- [Auto-assign action](https://github.com/marketplace/actions/auto-assign-action) — автоматически назначать ассайни
- [Labeler action](https://github.com/actions/labeler) — авто-проставление labels по изменённым файлам

##  Что должно получиться

После всех шагов:
- Структурированный монорепо со всей конфигурацией
- 30 issue с детальными описаниями, лейблами, milestones
- 27 labels для гранулярной фильтрации
- 3 milestones (MVP / v1.0 / v2.0)
- Шаблоны issue + PR применяются автоматически
- CI настроен для проверки PR
- Branch protection не даст замержить плохой код
- ADR-001 зафиксирован, шаблон для будущих готов

##  Дальше

Следующая задача — `[INFRA] Инициализация Turborepo monorepo`.
Открой её в issues, создай ветку `feature/infra-turborepo-init`, начинай работу.
