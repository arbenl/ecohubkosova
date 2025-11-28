#!/usr/bin/env bash
# Non-blocking MCP health check for CI
# In CI mode, this always exits 0 to not block the pipeline

MODE="local"
if [[ "${CI:-}" == "true" ]]; then
  MODE="ci"
fi

HTTP_MODE="${MCP_HTTP:-0}"
if [[ "${MODE}" != "ci" && "${HTTP_MODE}" == "1" ]]; then
  MODE="http"
fi

echo "[MCP-HEALTH] Running MCP infrastructure health check (mode: ${MODE})..."

# In CI, just log a notice and exit successfully - we don't need full MCP checks
if [[ "${MODE}" == "ci" ]]; then
  echo "[MCP-HEALTH] CI mode: skipping full health check (non-essential)"
  echo "[MCP-HEALTH] Continuing with core build checks..."
  exit 0
fi

set -euo pipefail

probe_sse() {
  local label="$1"
  local url="$2"
  local header_file body_file err_file
  header_file="$(mktemp)"
  body_file="$(mktemp)"
  err_file="$(mktemp)"
  echo "[MCP-HEALTH] Probing ${label} SSE via ${url}"
  set +e
  curl -s -D "${header_file}" -o "${body_file}" -N --max-time 2 "${url}" >/dev/null 2>"${err_file}"
  local curl_status=$?
  set -e
  local status_line status_code
  status_line="$(grep -i "^HTTP/" "${header_file}" | tail -n 1 | tr -d '\r')"
  status_code="$(awk '{print $2}' <<<"${status_line}")"
  if [[ "${status_code}" == "200" ]]; then
    if [[ "${curl_status}" -eq 28 ]]; then
      echo "[MCP-HEALTH] ${label} SSE responded with HTTP 200 (stream timed out after 2s as expected)"
    else
      echo "[MCP-HEALTH] ${label} SSE responded with HTTP 200"
    fi
  else
    local curl_error
    curl_error="$(tr -d '\r' < "${err_file}" | tail -n 1)"
    rm -f "${header_file}" "${body_file}" "${err_file}"
    echo "[MCP-HEALTH] ERROR: ${label} SSE probe failed (status ${status_code:-unknown}). ${curl_error:-curl exited ${curl_status}}" >&2
    exit 1
  fi
  rm -f "${header_file}" "${body_file}" "${err_file}"
}

if [[ "${HTTP_MODE}" == "1" ]]; then
  HOST="${MCP_HOST:-127.0.0.1}"
  CTX_PORT="${MCP_CONTEXT_PORT:-7337}"
  QA_PORT="${MCP_QA_PORT:-7338}"
  probe_sse "context" "http://${HOST}:${CTX_PORT}/sse"
  probe_sse "ecohub-qa" "http://${HOST}:${QA_PORT}/sse"
fi

node scripts/check-mcp-health.mjs --mode="${MODE}"
EXIT_CODE=$?

if [[ -f "logs/mcp-health.json" ]]; then
  STATUS_SUMMARY=$(node -e "const fs=require('fs');const path='logs/mcp-health.json';const data=JSON.parse(fs.readFileSync(path,'utf-8'));console.log(data.overallStatus||'unknown');")
  echo "[MCP-HEALTH] Summary: ${STATUS_SUMMARY}. Detailed report saved to logs/mcp-health.json"
else
  echo "[MCP-HEALTH] Failed to write logs/mcp-health.json"
fi

exit "${EXIT_CODE}"
