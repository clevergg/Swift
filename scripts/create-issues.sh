#!/usr/bin/env bash
# scripts/create-issues.sh
# Создаёт все issues из .github/issues.json в текущем репозитории через gh CLI.
# Запускать после scripts/setup-github.sh (нужны существующие labels и milestones).

set -euo pipefail

command -v gh >/dev/null 2>&1 || { echo "❌ gh CLI не установлен"; exit 1; }
command -v jq >/dev/null 2>&1 || { echo "❌ jq не установлен"; exit 1; }

REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
ISSUES_FILE=".github/issues.json"

if [[ ! -f "$ISSUES_FILE" ]]; then
  echo "❌ Файл $ISSUES_FILE не найден"
  exit 1
fi

TOTAL=$(jq 'length' "$ISSUES_FILE")
echo "📋 Создаём $TOTAL issues в $REPO..."
echo ""

i=0
jq -c '.[]' "$ISSUES_FILE" | while read -r issue; do
  i=$((i+1))
  title=$(echo "$issue" | jq -r '.title')
  body=$(echo "$issue" | jq -r '.body')
  milestone=$(echo "$issue" | jq -r '.milestone')

  # labels — массив, объединяем через запятую для gh CLI
  labels=$(echo "$issue" | jq -r '.labels | join(",")')

  echo "[$i/$TOTAL] $title"

  # Создание issue. Если milestone не существует — gh выдаст ошибку, поэтому
  # сначала пробуем с milestone, при неудаче — без
  if gh issue create \
      --title "$title" \
      --body "$body" \
      --label "$labels" \
      --milestone "$milestone" >/dev/null 2>&1; then
    echo "  ✅ создан"
  else
    # Fallback без milestone
    if gh issue create \
        --title "$title" \
        --body "$body" \
        --label "$labels" >/dev/null 2>&1; then
      echo "  ⚠️  создан без milestone (milestone '$milestone' не найден)"
    else
      echo "  ❌ ошибка создания"
    fi
  fi

  # Маленький sleep чтобы не упереться в rate limit
  sleep 0.3
done

echo ""
echo "✨ Готово! Все issues созданы."
echo "👉 Открой репозиторий: gh repo view --web"
