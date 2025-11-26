# MCP Toolkit Adoption Guide

The MCP Toolkit lives in a sibling repo (`../mcp-toolkit`) and ships generic servers plus health scripts. EcoHub keeps its existing bespoke servers, but you can opt into the toolkit any time without touching wrappers.

## Install & Configure

1. Clone the toolkit next to EcoHub: `git clone git@github.com:ecohub/mcp-toolkit.git ../mcp-toolkit`
2. Run `pnpm install` inside `../mcp-toolkit`
3. EcoHub already includes `.mcp-toolkit.json` describing build/test commands and allow-lists.

## Starting Servers

- Default (EcoHub-native): run `./run-mcp-tools.sh` or VS Code task `eco:dev-all`
- Toolkit mode: set `USE_MCP_TOOLKIT=1` (and optionally `MCP_TOOLKIT_PATH=/custom/path`) before launching `./run-mcp-tools.sh`/VS Code. The launcher script automatically switches to toolkit binaries when the env var is present.

## Health & Acceptance Flow

1. `USE_MCP_TOOLKIT=1 ./scripts/check-mcp-health.sh` – runs the stricter toolkit health check. CI uses `CI=true ./scripts/check-mcp-health.sh`.
2. `USE_MCP_TOOLKIT=1 ./scripts/mcp-acceptance.sh` – calls `../mcp-toolkit/scripts/mcp-acceptance.mjs` to probe each MCP tool and writes `logs/mcp-acceptance.json`.

Toolkit CLI variants (direct):

- `node ../mcp-toolkit/scripts/check-mcp-health.mjs --project-root=$(pwd)`
- `node ../mcp-toolkit/scripts/mcp-acceptance.mjs --project-root=$(pwd)`

Both reports land inside `logs/` for quick inspection.

## Troubleshooting

- **“initialize response” / connection closed**: ensure the toolkit repo exists, run `pnpm install` inside it, and verify `USE_MCP_TOOLKIT=1` when you want to switch.
- **Toolkit path mismatch**: set `MCP_TOOLKIT_PATH=/abs/path/to/mcp-toolkit`.
- **QA command missing**: update `.mcp-toolkit.json` (`qa.commands`) with the missing suite/command.
- **Navigation audit**: add `"navigation_audit": "pnpm test:navigation"` under `qa.commands` to enable that MCP tool.

## Optional Servers with Environment Gating

### GitHub MCP Server

GitHub MCP server is optional and environment-gated. To enable:

```bash
export USE_GITHUB_MCP=1
export GITHUB_TOKEN=ghp_your_token_here  # or GH_TOKEN
USE_MCP_TOOLKIT=1 ./scripts/mcp-acceptance.sh
```

Without `USE_GITHUB_MCP=1`, the server is skipped and acceptance continues normally.

### Strict Optional Mode

By default, optional server warnings don't fail acceptance. To enforce strict validation:

```bash
MCP_ACCEPT_STRICT_OPTIONAL=1 USE_MCP_TOOLKIT=1 ./scripts/mcp-acceptance.sh
```

**Behavior Modes:**

- **Default mode**: Required servers must pass; optional warnings are logged but don't fail (`overallStatus: "warn"`, exit 0)
- **Strict mode**: Optional warnings cause failure (`overallStatus: "fail"`, exit 1)
- **Skipped servers**: Servers with `enabledIfEnv` that aren't enabled are skipped (status: "skipped", doesn't affect pass/fail)
