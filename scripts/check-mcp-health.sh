#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

MODE="local"
if [[ "${CI:-}" == "true" ]]; then
  MODE="ci"
fi

echo "[MCP-HEALTH] Running MCP infrastructure health check (mode: ${MODE})..."
node scripts/check-mcp-health.mjs --mode="${MODE}"
EXIT_CODE=$?

if [[ -f "logs/mcp-health.json" ]]; then
  STATUS_SUMMARY=$(node -e "const fs=require('fs');const path='logs/mcp-health.json';const data=JSON.parse(fs.readFileSync(path,'utf-8'));console.log(data.overallStatus||'unknown');")
  echo "[MCP-HEALTH] Summary: ${STATUS_SUMMARY}. Detailed report saved to logs/mcp-health.json"
else
  echo "[MCP-HEALTH] Failed to write logs/mcp-health.json"
fi

exit "${EXIT_CODE}"
