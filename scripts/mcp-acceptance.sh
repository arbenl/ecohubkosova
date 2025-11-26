#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TOOLKIT_PATH="${MCP_TOOLKIT_PATH:-$PROJECT_ROOT/../mcp-toolkit}"

if [[ "${USE_MCP_TOOLKIT:-0}" != "1" ]]; then
  echo "[MCP-ACCEPTANCE] Set USE_MCP_TOOLKIT=1 to run acceptance via the shared toolkit." >&2
  echo "Example: USE_MCP_TOOLKIT=1 $0" >&2
  exit 1
fi

if [[ ! -d "$TOOLKIT_PATH" ]]; then
  echo "[MCP-ACCEPTANCE] Toolkit repo not found at $TOOLKIT_PATH" >&2
  exit 1
fi

echo "[MCP-ACCEPTANCE] Running toolkit acceptance from $TOOLKIT_PATH"
node "$TOOLKIT_PATH/scripts/mcp-acceptance.mjs" --project-root="$PROJECT_ROOT"
