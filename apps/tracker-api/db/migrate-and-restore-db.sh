#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <dump-file> [опциональные аргументы]" >&2
  exit 1
fi

DUMP="$1"

BACKUP="$HOME/workspaces/db-backups/$DUMP"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
set -a
source "$SCRIPT_DIR/../.env.development"
set +a

docker-compose down
docker-compose up -d db

ts-node "$SCRIPT_DIR/../tools/migrator" lts

docker exec -i tracker_db pg_restore -U "$DB_USERNAME" \
  -d "$DB_DATABASE" --clean --no-owner < "$BACKUP"

echo "Дамп файл взял из $BACKUP"
echo "✓ Восстановление выполнено"

