#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
set -a
source "$SCRIPT_DIR/../.env.development"
set +a

echo "💥 Завершаем все подключения к базе..."
docker exec -i tracker_db \
  psql -U "$DB_USERNAME" -d postgres -c "
    SELECT pg_terminate_backend(pid)
    FROM pg_stat_activity
    WHERE datname = '$DB_DATABASE' AND pid <> pg_backend_pid();
  "

docker exec -i tracker_db \
  psql -U "$DB_USERNAME" -d postgres -c "DROP DATABASE IF EXISTS $DB_DATABASE;"
docker exec -i tracker_db \
  psql -U "$DB_USERNAME" -d postgres -c "CREATE DATABASE $DB_DATABASE;"

echo "База $DB_DATABASE создана"

