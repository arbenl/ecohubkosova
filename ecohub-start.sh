#!/usr/bin/env bash
#
# ecohub-start.sh
# One-touch bootstrap for EcoHub Kosova:
#  - Starts MCP servers (via run-mcp-tools.sh)
#  - Starts Next.js dev server (pnpm dev)
#  - Runs dev orchestrator snapshot (pnpm dev:orchestrator)
#  - Keeps everything running until you press Ctrl+C, then shuts down cleanly.

set -euo pipefail

# --- Locals --------------------------------------------------------------

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$PROJECT_ROOT/logs"
mkdir -p "$LOG_DIR"

echo "🌿 EcoHub Kosova – unified dev bootstrap"
echo "   Project root: $PROJECT_ROOT"

# --- Cleanup handler -----------------------------------------------------

NEXT_PID=""
MCP_PID=""

cleanup() {
  echo ""
  echo "🧹 Shutting down background processes..."

  if [[ -n "${NEXT_PID:-}" ]] && ps -p "$NEXT_PID" >/dev/null 2>&1; then
    echo "  • Stopping Next dev (PID $NEXT_PID)"
    kill "$NEXT_PID" >/dev/null 2>&1 || true
  fi

  if [[ -n "${MCP_PID:-}" ]] && ps -p "$MCP_PID" >/dev/null 2>&1; then
    echo "  • Stopping MCP tools (PID $MCP_PID)"
    kill "$MCP_PID" >/dev/null 2>&1 || true
  fi

  echo "✅ Cleanup done."
}

trap cleanup INT TERM

# --- Start Next dev ------------------------------------------------------

echo ""
echo "▶️  Starting Next dev server (pnpm dev)…"
(
  cd "$PROJECT_ROOT"
  pnpm dev >"$LOG_DIR/next-dev.log" 2>&1
) &
NEXT_PID=$!
echo "   Next dev PID: $NEXT_PID (logs → $LOG_DIR/next-dev.log)"

# --- Start MCP servers ---------------------------------------------------

if [[ -x "$PROJECT_ROOT/run-mcp-tools.sh" ]]; then
  echo ""
  echo "▶️  Starting MCP servers (run-mcp-tools.sh)…"
  (
    cd "$PROJECT_ROOT"
    ./run-mcp-tools.sh >"$LOG_DIR/mcp-tools.log" 2>&1
  ) &
  MCP_PID=$!
  echo "   MCP tools PID: $MCP_PID (logs → $LOG_DIR/mcp-tools.log)"
else
  echo ""
  echo "⚠️  run-mcp-tools.sh not found or not executable; skipping MCP startup."
  MCP_PID=""
fi

# --- Run orchestrator snapshot -------------------------------------------

echo ""
echo "[DEV-ORCHESTRATOR] 🚀 EcoHub Dev Orchestrator Starting"
(
  cd "$PROJECT_ROOT"
  pnpm dev:orchestrator
)

echo ""
echo "✅ Orchestrator snapshot completed."

echo ""
echo "💡 Next steps:"
echo "   1) Open a browser at:   http://localhost:3000"
echo "   2) Pick your model and load the matching prompt, for example:"
echo "        cat prompts/bootstrap.codex-cli.md"
echo "        cat prompts/bootstrap.claude.md"
echo "        cat prompts/bootstrap.chatgpt.md"
echo "   3) Start giving it tasks – MCP + orchestrator context are now live for this session."
echo ""
echo "ℹ️ This script will keep Next dev + MCP servers running in the background."
echo "   Press Ctrl+C here when you’re done; it will shut them down cleanly."
echo ""
echo "🌱 EcoHub dev environment is up. Happy hacking!"

# --- Block until user stops it -------------------------------------------

# Wait for the main dev server; Ctrl+C will trigger cleanup()
wait "$NEXT_PID"