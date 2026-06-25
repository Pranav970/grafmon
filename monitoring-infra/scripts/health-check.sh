#!/usr/bin/env bash
set -euo pipefail

NGINX_PORT="${NGINX_PORT:-8080}"
PROMETHEUS_PORT="${PROMETHEUS_PORT:-9090}"
GRAFANA_PORT="${GRAFANA_PORT:-3001}"
ALERTMANAGER_PORT="${ALERTMANAGER_PORT:-9093}"
LOKI_PORT="${LOKI_PORT:-3100}"
BASE_URL="http://localhost:${NGINX_PORT}"
PROM_URL="http://localhost:${PROMETHEUS_PORT}"
GRAFANA_URL="http://localhost:${GRAFANA_PORT}"
AM_URL="http://localhost:${ALERTMANAGER_PORT}"
LOKI_URL="http://localhost:${LOKI_PORT}"

PASS=0
FAIL=0

check() {
  local label="$1"
  local url="$2"
  local http_code

  http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 3 "$url" || echo "000")

  if [[ "$http_code" == "200" ]]; then
    echo "  [OK]   $label — $url"
    ((PASS++)) || true
  else
    echo "  [FAIL] $label — $url (HTTP $http_code)"
    ((FAIL++)) || true
  fi
}

echo "==> Health check — $(date)"

echo ""
echo "--- Application ---"
check "App root"      "$BASE_URL/"
check "App health"    "$BASE_URL/health"
check "App users"     "$BASE_URL/api/users"
check "Nginx health"  "$BASE_URL/nginx-health"

echo ""
echo "--- Observability ---"
check "Prometheus UI"      "$PROM_URL"
check "Prometheus healthy" "$PROM_URL/-/healthy"
check "Prometheus ready"   "$PROM_URL/-/ready"
check "Node Exporter"      "http://localhost:9100/metrics"
check "Nginx Exporter"     "http://localhost:9113/metrics"

echo ""
echo "--- Alerting ---"
check "Alertmanager UI"      "$AM_URL"
check "Alertmanager healthy" "$AM_URL/-/healthy"
check "Alertmanager ready"   "$AM_URL/-/ready"

echo ""
echo "--- Logs ---"
check "Loki ready"    "$LOKI_URL/ready"
check "Loki metrics"  "$LOKI_URL/metrics"
check "Promtail"      "http://localhost:9080/ready"

echo ""
echo "--- Grafana ---"
check "Grafana UI"     "$GRAFANA_URL"
check "Grafana health" "$GRAFANA_URL/api/health"

echo ""
echo "==> Results: ${PASS} passed, ${FAIL} failed."
[[ "$FAIL" -eq 0 ]] && exit 0 || exit 1
