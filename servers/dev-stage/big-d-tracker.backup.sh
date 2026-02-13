#!/usr/bin/env bash
set -euo pipefail

# Load .env рядом со скриптом
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/.env"

if [[ -f "${ENV_FILE}" ]]; then
  # shellcheck disable=SC1090
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
FILE="${BACKUP_DIR}/big-d-tracker-${DATE}.dump"
LOG_PREFIX="[pg-backup:big-d-tracker]"

mkdir -p "${BACKUP_DIR}"

echo "${LOG_PREFIX} creating dump: ${FILE}"

TMP="/tmp/big-d-tracker_backup.dump"

docker exec -e PGPASSWORD="${GOAL_TRACKER_DB_PASSWORD}" "${CONTAINER}" \
  pg_dump -U "${DB_USERNAME}" -p "${DB_PORT}" -Fc -f "${TMP}" big_d_tracker

docker cp "${CONTAINER}:${TMP}" "${FILE}"
docker exec "${CONTAINER}" rm -f "${TMP}"

echo "${LOG_PREFIX} dump created: $(du -h "${FILE}" | awk '{print $1}')"