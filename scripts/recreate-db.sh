#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
set -a
source "$SCRIPT_DIR/../.env.development"
set +a

CONTAINER="tracker_db"

if ! docker inspect "$CONTAINER" >/dev/null 2>&1; then
  echo "Контейнер '$CONTAINER' не найден — выходим."
  exit 0
fi

state=$(docker inspect -f '{{.State.Running}}' "$CONTAINER")
if [[ "$state" != "true" ]]; then
  echo "Контейнер '$CONTAINER' не в состоянии running (state=$state) — выходим."
  exit 0
fi

health=$(docker inspect -f '{{with .State.Health}}{{.Status}}{{else}}none{{end}}' "$CONTAINER")
if [[ "$health" != "healthy" ]]; then
  echo "Контейнер '$CONTAINER' health='$health' — дождитесь пока он станет healthy."
  exit 0
fi

echo "💥 Завершаем все подключения к базе..."
docker exec -i "$CONTAINER" \
  psql -U "$DB_USERNAME" -d postgres -c "
    SELECT pg_terminate_backend(pid)
    FROM pg_stat_activity
    WHERE datname = '$DB_DATABASE' AND pid <> pg_backend_pid();
  "

docker exec -i "$CONTAINER" \
  psql -U "$DB_USERNAME" -d postgres -c "DROP DATABASE IF EXISTS $DB_DATABASE;"
docker exec -i "$CONTAINER" \
  psql -U "$DB_USERNAME" -d postgres -c "CREATE DATABASE $DB_DATABASE;"

echo "База $DB_DATABASE создана"

