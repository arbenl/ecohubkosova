#!/usr/bin/env bash
set -euo pipefail
export DOTENV_CONFIG_QUIET=true

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <server-name>" >&2
  exit 1
fi

SERVER="$1"
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TOOLKIT_PATH="${MCP_TOOLKIT_PATH:-$ROOT_DIR/../mcp-toolkit}"
USE_TOOLKIT="${USE_MCP_TOOLKIT:-0}"

run_server() {
  local target="$1"
  shift
  exec "$target" "$@"
}

case "$SERVER" in
  mcp-context-server)
    if [[ "$USE_TOOLKIT" == "1" ]]; then
      CANDIDATE="$TOOLKIT_PATH/servers/repo-context-server/src/index.mjs"
      if [[ -f "$CANDIDATE" ]]; then
        exec node "$CANDIDATE"
      fi
    fi
    exec node "$ROOT_DIR/tools/mcp-context-server/dist/server.js"
    ;;
  ecohub-qa)
    if [[ "$USE_TOOLKIT" == "1" ]]; then
      CANDIDATE="$TOOLKIT_PATH/servers/repo-qa-server/src/index.mjs"
      if [[ -f "$CANDIDATE" ]]; then
        exec node "$CANDIDATE"
      fi
    fi
    exec node "$ROOT_DIR/tools/ecohub-qa/dist/index.js"
    ;;
  hyperexecute-qa)
    if [[ "$USE_TOOLKIT" == "1" ]]; then
      CANDIDATE="$TOOLKIT_PATH/servers/hyperexecute-qa-server/src/index.mjs"
      if [[ -f "$CANDIDATE" ]]; then
        exec node "$CANDIDATE"
      fi
    fi
    exec node "$ROOT_DIR/tools/hyperexecute-qa/dist/index.js"
    ;;
  *)
    echo "Unknown server $SERVER" >&2
    exit 1
    ;;
esac
