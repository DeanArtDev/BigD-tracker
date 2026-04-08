#!/usr/bin/env sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
ROOT_DIR=$(CDPATH= cd -- "${SCRIPT_DIR}/../.." && pwd)
ENV_FILE="${ROOT_DIR}/.env"

if [ -f "${ENV_FILE}" ]; then
  # shellcheck disable=SC1090
  . "${ENV_FILE}"
fi

CONTAINER_NAME="${ARCHITECTURE_VISUALIZE_CONTAINER_NAME:-big-d-structurizr-lite}"
PORT="${ARCHITECTURE_VISUALIZE_PORT:-8080}"
WORKSPACE_DIR="${ROOT_DIR}/docs/architecture/c4"
URL="http://localhost:${PORT}/workspace/1/diagrams"

docker rm -f "${CONTAINER_NAME}" >/dev/null 2>&1 || true

docker run -d \
  --name "${CONTAINER_NAME}" \
  -p "${PORT}:8080" \
  -v "${WORKSPACE_DIR}:/usr/local/structurizr" \
  structurizr/structurizr local >/dev/null

sleep 4
open "${URL}"
