# MCP Toolkit Adoption Guide

The MCP Toolkit lives in a sibling repo (`../mcp-toolkit`) and ships generic servers plus health scripts. EcoHub keeps its existing bespoke servers, but you can opt into the toolkit any time without touching wrappers.

## Install & Configure

1. Clone the toolkit next to EcoHub: `git clone git@github.com:ecohub/mcp-toolkit.git ../mcp-toolkit`
2. Run `pnpm install` inside `../mcp-toolkit`
3. EcoHub already includes `.mcp-toolkit.json` describing build/test commands and allow-lists.

## Starting Servers

- Default (EcoHub-native): run `./run-mcp-tools.sh` or VS Code task `eco:dev-all`
- Toolkit mode: set `USE_MCP_TOOLKIT=1` (and optionally `MCP_TOOLKIT_PATH=/custom/path`) before launching `./run-mcp-tools.sh`/VS Code. The launcher script automatically switches to toolkit binaries when the env var is present.

## Health Checks

- Local: `./scripts/check-mcp-health.sh` (wraps the project-local script, which may call the toolkit version later)
- CI-safe: `CI=true ./scripts/check-mcp-health.sh`
- Toolkit CLI: `node ../mcp-toolkit/scripts/check-mcp-health.mjs --project-root=$(pwd)` if you need to troubleshoot the generic script directly.

The report is written to `logs/mcp-health.json` with per-server tool listings.

## Troubleshooting

- **“initialize response” / connection closed**: ensure the toolkit repo exists, run `pnpm install` inside it, and verify `USE_MCP_TOOLKIT=1` when you want to switch.
- **Toolkit path mismatch**: set `MCP_TOOLKIT_PATH=/abs/path/to/mcp-toolkit`.
- **QA command missing**: update `.mcp-toolkit.json` (qa.testSuites) with the missing suite.
- **Navigation audit**: not configured today; add `"navigationAudit": "pnpm test:navigation"` under `qa` if/when available.
