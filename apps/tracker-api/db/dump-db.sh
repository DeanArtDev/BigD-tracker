#!/usr/bin/env bash
set -euo pipefail

BACKUP="$HOME/workspaces/db-backups/db-$(date +%F).dump"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
set -a
source "$SCRIPT_DIR/../.env.development"
set +a

docker exec tracker_db \
  pg_dump -U "$DB_USERNAME" -F c "$DB_DATABASE" > "$BACKUP"

echo "✓ Дамп успешно завершен"

