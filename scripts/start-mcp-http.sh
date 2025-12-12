#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HOST="${MCP_HOST:-127.0.0.1}"
ALLOW_ORIGIN="${MCP_ALLOW_ORIGIN:-*}"
DEFAULT_CTX_PORT="${MCP_CONTEXT_PORT:-7337}"
DEFAULT_QA_PORT="${MCP_QA_PORT:-7338}"
DEFAULT_HYPEREXECUTE_PORT="${MCP_HYPEREXECUTE_PORT:-7341}"
MCP_PROXY_BIN="${MCP_PROXY_BIN:-mcp-proxy}"

if ! command -v "$MCP_PROXY_BIN" >/dev/null 2>&1; then
  echo "[MCP] Unable to locate $MCP_PROXY_BIN in PATH" >&2
  exit 1
fi

sanitize_port() {
  local value="$1"
  local fallback="$2"
  if [[ "$value" =~ ^[0-9]+$ ]] && (( value > 0 && value < 65536 )); then
    echo "$value"
  else
    echo "$fallback"
  fi
}

port_is_free() {
  local port="$1"
  local host="$2"
  if node - "$port" "$host" <<'NODE'
const net = require("net");
const port = Number(process.argv[2]);
const host = process.argv[3] || "127.0.0.1";
const server = net.createServer();
server.once("error", () => process.exit(1));
server.listen(port, host, () => server.close(() => process.exit(0)));
NODE
  then
    return 0
  fi
  return 1
}

kill_listeners() {
  local port="$1"
  local label="$2"
  if ! command -v lsof >/dev/null 2>&1; then
    return 1
  fi
  local pids
  pids=$(lsof -ti tcp:"$port" -sTCP:LISTEN 2>/dev/null | tr '\n' ' ')
  if [[ -z "$pids" ]]; then
    return 1
  fi
  echo "[MCP] Killing existing $label listeners on port $port: $pids" >&2
  kill $pids 2>/dev/null || true
  sleep 0.2
  local remaining
  remaining=$(lsof -ti tcp:"$port" -sTCP:LISTEN 2>/dev/null | tr '\n' ' ')
  if [[ -n "$remaining" ]]; then
    echo "[MCP] Force killing remaining $label listeners on port $port: $remaining" >&2
    kill -9 $remaining 2>/dev/null || true
    sleep 0.2
  fi
  return 0
}

allocate_port() {
  local requested="$1"
  local label="$2"
  local port="$requested"
  local attempts=0
  local max_attempts=25

  while (( attempts < max_attempts )); do
    if port_is_free "$port" "$HOST"; then
      if [[ "$port" != "$requested" ]]; then
        echo "[MCP] Assigned alternate port $port for $label" >&2
      fi
      echo "$port"
      return 0
    fi

    if kill_listeners "$port" "$label"; then
      ((attempts++))
      continue
    fi

    ((port++))
    ((attempts++))
  done

  echo "[MCP] Unable to allocate port for $label" >&2
  exit 1
}

CTX_PORT=$(sanitize_port "$DEFAULT_CTX_PORT" 7337)
QA_PORT=$(sanitize_port "$DEFAULT_QA_PORT" 7338)
HYPEREXECUTE_PORT=$(sanitize_port "$DEFAULT_HYPEREXECUTE_PORT" 7341)
CTX_PORT=$(allocate_port "$CTX_PORT" "context")
QA_PORT=$(allocate_port "$QA_PORT" "ecohub-qa")
HYPEREXECUTE_PORT=$(allocate_port "$HYPEREXECUTE_PORT" "hyperexecute-qa")

CTX_SSE="http://${HOST}:${CTX_PORT}/sse"
QA_SSE="http://${HOST}:${QA_PORT}/sse"
HYPEREXECUTE_SSE="http://${HOST}:${HYPEREXECUTE_PORT}/sse"

PIDS=()
LABELS=()

cleanup() {
  local status=$?
  trap - INT TERM EXIT
  if (( ${#PIDS[@]} > 0 )); then
    echo
    echo "[MCP] Stopping proxies..."
    kill "${PIDS[@]}" 2>/dev/null || true
    for pid in "${PIDS[@]}"; do
      wait "$pid" 2>/dev/null || true
    done
  fi
  exit "$status"
}
trap cleanup INT TERM EXIT

start_proxy() {
  local label="$1"
  local port="$2"
  shift 2
  local cmd=("$@")
  echo "[MCP] Launching $label via $MCP_PROXY_BIN on port $port"
  "$MCP_PROXY_BIN" --transport sse --host "$HOST" --port "$port" --allow-origin "$ALLOW_ORIGIN" \
    --cwd "$ROOT" -- "${cmd[@]}" &
  local pid=$!
  PIDS+=("$pid")
  LABELS+=("$label")
}

check_startup() {
  sleep 1
  for idx in "${!PIDS[@]}"; do
    local pid="${PIDS[$idx]}"
    local label="${LABELS[$idx]}"
    if ! kill -0 "$pid" >/dev/null 2>&1; then
      echo "[MCP] ERROR: $label failed to stay alive." >&2
      exit 1
    fi
  done
}

monitor_proxies() {
  while true; do
    for idx in "${!PIDS[@]}"; do
      local pid="${PIDS[$idx]}"
      local label="${LABELS[$idx]}"
      if kill -0 "$pid" >/dev/null 2>&1; then
        continue
      fi
      wait "$pid"
      local code=$?
      if [[ "$code" -ne 0 ]]; then
        echo "[MCP] $label exited with code $code" >&2
        exit "$code"
      else
        echo "[MCP] $label stopped."
        exit 0
      fi
    done
    sleep 1
  done
}

echo "[MCP] Starting HTTP/SSE proxies..."
echo "[MCP] Workspace: $ROOT"
echo "[MCP] Allow-Origin: $ALLOW_ORIGIN"
echo "CTX_SSE=${CTX_SSE}"
echo "QA_SSE=${QA_SSE}"
echo "HYPEREXECUTE_SSE=${HYPEREXECUTE_SSE}"

start_proxy "context" "$CTX_PORT" env DOTENV_CONFIG_QUIET=true MCP_STDIO=1 node "$ROOT/tools/mcp-context-server/dist/server.js"
start_proxy "ecohub-qa" "$QA_PORT" env DOTENV_CONFIG_QUIET=true MCP_STDIO=1 node "$ROOT/tools/ecohub-qa/dist/index.js"
start_proxy "hyperexecute-qa" "$HYPEREXECUTE_PORT" env DOTENV_CONFIG_QUIET=true MCP_STDIO=1 node "$ROOT/tools/hyperexecute-qa/dist/index.js"

check_startup

echo "[MCP] Proxies running. Press Ctrl+C to stop."
monitor_proxies
