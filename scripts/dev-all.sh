#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOG_DIR="$ROOT/mcp-outputs"
MCP_WARMER="$ROOT/run-mcp-tools.sh"

mkdir -p "$LOG_DIR"

cleanup() {
  if [[ -n "${DEV_PID-}" ]]; then
    kill "$DEV_PID" 2>/dev/null || true
  fi
  if [[ -n "${MCP_HELPER_PID-}" ]]; then
    kill "$MCP_HELPER_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

echo "[dev:all] Starting MCP helper tasks (best effort)..."
if [[ -x "$MCP_WARMER" ]]; then
  bash "$MCP_WARMER" &
  MCP_HELPER_PID=$!
else
  echo "[dev:all] Skipping MCP helper; missing $MCP_WARMER"
fi

echo "[dev:all] Starting Next.js dev server (pnpm dev)..."
pnpm dev &
DEV_PID=$!

wait "$DEV_PID"
