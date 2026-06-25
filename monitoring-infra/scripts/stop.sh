#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_DIR="$(dirname "$SCRIPT_DIR")"

echo "==> Stopping the monitoring stack..."
docker compose -f "$COMPOSE_DIR/docker-compose.yml" down

echo "==> Stack stopped."
