#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_DIR="$(dirname "$SCRIPT_DIR")"

echo "==> Building and starting the monitoring stack..."
docker compose -f "$COMPOSE_DIR/docker-compose.yml" up --build -d

echo ""
echo "==> Stack is up. Services:"
docker compose -f "$COMPOSE_DIR/docker-compose.yml" ps

echo ""
echo "==> App available at: http://localhost:${NGINX_PORT:-8080}"
