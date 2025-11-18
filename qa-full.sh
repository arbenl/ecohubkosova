#!/usr/bin/env bash
set -e

cd "$(dirname "$0")/tools/ecohub-qa"

echo "🔎 Running FULL QA..."

# 1) Config & deps
node run-qa-tool.js env_audit
node run-qa-tool.js supabase_health
node run-qa-tool.js dependency_audit

# 2) Core correctness
node run-qa-tool.js build_health
node run-qa-tool.js tests_orchestrator
node run-qa-tool.js coverage_audit

# 3) Auth & routing
node run-qa-tool.js auth_audit
node run-qa-tool.js navigation_audit

# 4) Runtime & security
node run-qa-tool.js runtime_log_scan
node run-qa-tool.js csp_audit

# 5) UX & i18n
node run-qa-tool.js performance_audit
node run-qa-tool.js accessibility_audit
node run-qa-tool.js i18n_audit

echo "✅ FULL QA finished."
