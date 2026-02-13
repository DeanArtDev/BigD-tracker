#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/.env"

if [[ -f "${ENV_FILE}" ]]; then
  set -a
  source "${ENV_FILE}"
  set +a
else
  echo "[pg-backup] ERROR: .env not found рядом со скриптом: ${ENV_FILE}" >&2
  exit 1
fi

DUMP_FILE="${1:-}"

if [[ -z "${DUMP_FILE}" || ! -f "${DUMP_FILE}" ]]; then
  echo "Usage: $0 /path/to/backup.dump big_d_tracker"
  exit 2
fi

CONTAINER="${CONTAINER}"
DB_USERNAME="${DB_USERNAME}"
DB_PORT="${DB_PORT}"
DB_PASSWORD="${GOAL_TRACKER_DB_PASSWORD?GOAL_TRACKER_DB_PASSWORD is required}"

LOG_PREFIX="[pg-restore:big_d_tracker]"
TMP_DUMP="/tmp/restore.dump"

echo "${LOG_PREFIX} copy dump into container"
docker cp "${DUMP_FILE}" "${CONTAINER}:${TMP_DUMP}"

echo "${LOG_PREFIX} restore into big_d_tracker"
docker exec -e PGPASSWORD="${DB_PASSWORD}" "${CONTAINER}" \
  pg_restore \
    -U "${DB_USERNAME}" \
    -p "${DB_PORT}" \
    -d big_d_tracker \
    --clean \
    --if-exists \
    "${TMP_DUMP}"

echo "${LOG_PREFIX} cleanup"
docker exec "${CONTAINER}" rm -f "${TMP_DUMP}"

echo "${LOG_PREFIX} done"
