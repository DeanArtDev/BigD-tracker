#!/usr/bin/env bash
set -euo pipefail


SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
set -a
source "$SCRIPT_DIR/../../../../.env.development"
set +a

BACKUP="$SCRIPT_DIR/../../db/dumps/db-initial.dump"

pnpm migrate lts

docker exec -i tracker_db_dev pg_restore -U "$DB_USERNAME" \
  -d "$DB_DATABASE" --clean --no-owner < "$BACKUP"

echo "Дамп файл взял из $BACKUP"
echo "✓ Восстановление выполнено"

