#!/usr/bin/env bash
set -euo pipefail

echo "⏳ Ждем пока база будет готова..."
until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME"; do
  sleep 1
done

export PGPASSWORD="$DB_PASSWORD"
TAB_COUNT=$(psql -tA -h "$DB_HOST" -p "$DB_PORT" \
  -U "$DB_USERNAME" -d "$DB_DATABASE" \
  -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';")

echo "TAB_COUNT: $TAB_COUNT"

if [ "$TAB_COUNT" -eq 0 ]; then
  DUMP_PATH="/db-dumps/db-initial.dump"
  if [ -f "$DUMP_PATH" ]; then
      pg_restore --no-privileges \
          --host "$DB_HOST" \
          --port "$DB_PORT" \
          --username "$DB_USERNAME" \
          --dbname="$DB_DATABASE" \
          "$DUMP_PATH"

      echo "✅ Дамп успешно загружен"
  else
    echo "❌ Дамп не найден по пути $DUMP_PATH, пропускаем заливку"
  fi
fi