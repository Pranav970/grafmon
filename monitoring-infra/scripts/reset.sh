#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_DIR="$(dirname "$SCRIPT_DIR")"

echo "==> WARNING: This will remove all containers, volumes, and built images for this stack."
read -rp "Continue? [y/N] " confirm
[[ "$confirm" =~ ^[Yy]$ ]] || { echo "Aborted."; exit 0; }

echo "==> Tearing down..."
docker compose -f "$COMPOSE_DIR/docker-compose.yml" down --volumes --rmi local

echo "==> Reset complete. Run ./start.sh to rebuild from scratch."
