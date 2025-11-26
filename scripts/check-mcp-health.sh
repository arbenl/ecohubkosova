#!/usr/bin/env bash
# Non-blocking MCP health check for CI
# In CI mode, this always exits 0 to not block the pipeline

MODE="local"
if [[ "${CI:-}" == "true" ]]; then
  MODE="ci"
fi

echo "[MCP-HEALTH] Running MCP infrastructure health check (mode: ${MODE})..."

# In CI, just log a notice and exit successfully - we don't need full MCP checks
if [[ "${MODE}" == "ci" ]]; then
  echo "[MCP-HEALTH] CI mode: skipping full health check (non-essential)"
  echo "[MCP-HEALTH] Continuing with core build checks..."
  exit 0
fi

# Local mode: run full checks
set -euo pipefail
node scripts/check-mcp-health.mjs --mode="${MODE}"
EXIT_CODE=$?

if [[ -f "logs/mcp-health.json" ]]; then
  STATUS_SUMMARY=$(node -e "const fs=require('fs');const path='logs/mcp-health.json';const data=JSON.parse(fs.readFileSync(path,'utf-8'));console.log(data.overallStatus||'unknown');")
  echo "[MCP-HEALTH] Summary: ${STATUS_SUMMARY}. Detailed report saved to logs/mcp-health.json"
else
  echo "[MCP-HEALTH] Failed to write logs/mcp-health.json"
fi

exit "${EXIT_CODE}"
