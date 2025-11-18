#!/usr/bin/env bash
set -e

cd "$(dirname "$0")/tools/ecohub-qa"

echo "🔎 Running QUICK QA (env, supabase, build, tests)..."

node run-qa-tool.js env_audit
node run-qa-tool.js supabase_health
node run-qa-tool.js build_health
node run-qa-tool.js tests_orchestrator

echo "✅ QUICK QA finished."
