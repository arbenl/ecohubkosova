#!/usr/bin/env bash
set -euo pipefail

ROOT=$(cd "$(dirname "$0")" && pwd)
MCP_CONTEXT="$ROOT/tools/mcp-context-server/dist/server.js"
ECOHUB_QA="$ROOT/tools/ecohub-qa/dist/index.js"
HYPEREXECUTE_QA="$ROOT/tools/hyperexecute-qa/dist/index.js"
CONTEXT7_BIN="$ROOT/node_modules/.bin/context7-mcp"
PLAYWRIGHT_BIN="$ROOT/node_modules/.bin/mcp-server-playwright"
BRAVE_BIN="$ROOT/node_modules/.bin/brave-search-mcp-server"
MARKITDOWN_BIN="$(command -v markitdown-mcp || true)"
LOG_DIR="$ROOT/logs/mcp"

mkdir -p "$LOG_DIR"

PIDS=()

start_server() {
  local name=$1; shift
  local log_file="$LOG_DIR/${name}.log"
  echo "[MCP] Starting $name -> $*" | tee "$log_file"
  "$@" >>"$log_file" 2>&1 &
  PIDS+=($!)
}

note_todo() {
  local name=$1
  local message=$2
  echo "[MCP] TODO: $name not implemented – $message" | tee "$LOG_DIR/${name}.log"
}

cleanup() {
  for pid in "${PIDS[@]}"; do
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null || true
    fi
  done
}
trap cleanup EXIT INT TERM

if [[ -f "$MCP_CONTEXT" ]]; then
  start_server "mcp-context-server" node "$MCP_CONTEXT"
else
  echo "[MCP] mcp-context-server binary missing at $MCP_CONTEXT"
fi

if [[ -f "$ECOHUB_QA" ]]; then
  start_server "ecohub-qa" node "$ECOHUB_QA"
else
  echo "[MCP] ecohub-qa binary missing at $ECOHUB_QA"
fi

if [[ -f "$HYPEREXECUTE_QA" ]]; then
  start_server "hyperexecute-qa" node "$HYPEREXECUTE_QA"
else
  echo "[MCP] hyperexecute-qa binary missing at $HYPEREXECUTE_QA"
fi

if [[ -x "$CONTEXT7_BIN" ]]; then
  start_server "context7" "$CONTEXT7_BIN"
else
  note_todo "context7" "install @upstash/context7-mcp (pnpm add -D @upstash/context7-mcp)"
fi

if [[ -x "$PLAYWRIGHT_BIN" ]]; then
  start_server "playwright" "$PLAYWRIGHT_BIN"
else
  note_todo "playwright" "install @playwright/mcp (pnpm add -D @playwright/mcp)"
fi

if [[ -x "$BRAVE_BIN" ]]; then
  start_server "brave-search" "$BRAVE_BIN" --transport stdio
else
  note_todo "brave-search" "install @brave/brave-search-mcp-server (pnpm add -D @brave/brave-search-mcp-server)"
fi

if [[ -n "$MARKITDOWN_BIN" ]]; then
  start_server "markitdown" "$MARKITDOWN_BIN" --http --port 3001
else
  note_todo "markitdown" "pipx install markitdown-mcp (optional extras: markitdown[all])"
fi

# Planned MCP servers (declared, not implemented yet)
note_todo "mcp-db-schema" "no local package present"
note_todo "mcp-db-inspect" "no local package present"
note_todo "mcp-test-runner" "no local package present"
note_todo "mcp-docs-knowledge" "no local package present"
note_todo "mcp-ux-assets" "no local package present"

if ((${#PIDS[@]} == 0)); then
  echo "[MCP] No MCP servers started"
  exit 0
fi

echo "[MCP] Servers started. Logs → $LOG_DIR"
wait "${PIDS[@]}"
