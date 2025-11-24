#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "[MCP-HEALTH] Running MCP + build health check..."
node tools/run-mcp-task.js build_health '{}' || {
  echo "[MCP-HEALTH] FAILED – see mcp-outputs/build_health.log"
  exit 1
}

echo "[MCP-HEALTH] OK – MCP servers and build are healthy."
