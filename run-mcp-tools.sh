#!/usr/bin/env bash
set -euo pipefail

ROOT=$(cd "$(dirname "$0")" && pwd)
MCP_CONTEXT="$ROOT/../mcp-context-server/dist/server.js"
ECOHUB_QA="$ROOT/tools/ecohub-qa/dist/index.js"
OUTPUT_DIR="$ROOT/mcp-outputs"

mkdir -p "$OUTPUT_DIR"

run_tool() {
  local name=$1; shift
  local target="$OUTPUT_DIR/$name.log"
  echo "Running: $*" > "$target"
  "$@" >> "$target" 2>&1
}

run_tool "project_map" node "$MCP_CONTEXT" project_map
run_tool "code_search" node "$MCP_CONTEXT" code_search --query="runtime" --paths="src/middleware.ts,next.config.mjs,src/app/[locale]/**"
run_tool "read_files" node "$MCP_CONTEXT" read_files --paths="src/middleware.ts,next.config.mjs,src/app/[locale]/layout.tsx,src/app/[locale]/page.tsx"
run_tool "build_health" node "$ECOHUB_QA" build_health
run_tool "runtime_log_sq" node "$ECOHUB_QA" runtime_log_scan --scope=production --route=/sq/home
run_tool "runtime_log_en" node "$ECOHUB_QA" runtime_log_scan --scope=production --route=/en/home
run_tool "navigation_audit" node "$ECOHUB_QA" navigation_audit --routes="/sq/home,/en/home"

echo "Output saved under $OUTPUT_DIR"
