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

DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT}
DB_USERNAME=${DB_USERNAME}
DATE="$(date +'%Y-%m-%d_%H-%M')"
FILE="${BACKUP_DIR}/goal-tracker-${DATE}.dump"
LOG_PREFIX="[pg-backup:goal-tracker]"

mkdir -p "${BACKUP_DIR}"

echo "${LOG_PREFIX} creating dump: ${FILE}"

TMP="/tmp/goal-tracker_backup.dump"

docker exec -e PGPASSWORD="${GOAL_TRACKER_DB_PASSWORD}" "${CONTAINER}" \
  pg_dump -U "${DB_USERNAME}" -p "${DB_PORT}" -Fc -f "${TMP}" goal_tracker

docker cp "${CONTAINER}:${TMP}" "${FILE}"
docker exec "${CONTAINER}" rm -f "${TMP}"

echo "${LOG_PREFIX} dump created: $(du -h "${FILE}" | awk '{print $1}')"