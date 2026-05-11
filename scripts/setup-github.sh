#!/usr/bin/env bash
# scripts/setup-github.sh
# Инициализация labels и milestones для репозитория Swift CRM.
# Требования: установленный gh CLI (https://cli.github.com/) и jq.
# Запуск: bash scripts/setup-github.sh

set -euo pipefail

# ──────────────────────────────────────────────────────────────────────────────
#  Проверка зависимостей
# ──────────────────────────────────────────────────────────────────────────────

command -v gh >/dev/null 2>&1 || { echo "❌ gh CLI не установлен. https://cli.github.com/"; exit 1; }
command -v jq >/dev/null 2>&1 || { echo "❌ jq не установлен. brew install jq | apt install jq"; exit 1; }

REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
echo "📦 Работаем с репозиторием: $REPO"
echo ""

# ──────────────────────────────────────────────────────────────────────────────
#  1. Создание labels из labels.json
# ──────────────────────────────────────────────────────────────────────────────

echo "🏷️  Создаём labels..."

LABELS_FILE=".github/labels.json"
if [[ ! -f "$LABELS_FILE" ]]; then
  echo "❌ Файл $LABELS_FILE не найден"
  exit 1
fi

jq -c '.[]' "$LABELS_FILE" | while read -r label; do
  name=$(echo "$label" | jq -r '.name')
  color=$(echo "$label" | jq -r '.color')
  description=$(echo "$label" | jq -r '.description')

  # --force перезаписывает существующий label с тем же именем
  if gh label create "$name" --color "$color" --description "$description" --force >/dev/null 2>&1; then
    echo "  ✅ $name"
  else
    echo "  ⚠️  $name (ошибка)"
  fi
done

echo ""

# ──────────────────────────────────────────────────────────────────────────────
#  2. Создание milestones
# ──────────────────────────────────────────────────────────────────────────────

echo "🎯 Создаём milestones..."

create_milestone() {
  local title="$1"
  local description="$2"
  local due_on="$3"

  # gh CLI пока не имеет команды для milestones — используем API напрямую
  if gh api "repos/$REPO/milestones" \
    --method POST \
    --field title="$title" \
    --field description="$description" \
    --field due_on="$due_on" \
    --field state="open" >/dev/null 2>&1; then
    echo "  ✅ $title"
  else
    echo "  ⚠️  $title (возможно уже существует)"
  fi
}

# Даты — корректируй под свой план
create_milestone "MVP"  "Базовая канбан-доска: auth, клиенты, доска, drag-and-drop"          "2026-06-30T23:59:59Z"
create_milestone "v1.0" "Полная версия: команды, роли, real-time, аналитика, уведомления" "2026-08-31T23:59:59Z"
create_milestone "v2.0" "Расширение: мобильное приложение, интеграции, advanced features"  "2026-10-31T23:59:59Z"

echo ""
echo "✨ Готово! Labels и milestones созданы."
echo ""
echo "Следующий шаг: bash scripts/create-issues.sh"
