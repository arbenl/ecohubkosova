## MCP Bootstrap Checklist

1. Start the local environment (`./ecohub-start.sh` or `pnpm dev:all`) so MCP servers are already running.
2. Run `./scripts/check-mcp-health.sh` and ensure `logs/mcp-health.json` reports `Status=OK` before engaging any models (contract lives in `tools/mcp-contract.json`).
3. Treat `tools/run-mcp-task.js` and all server implementations as read-only—models consume wrappers, they never “improve” them.

### Troubleshooting

- Review `logs/mcp-health.json` for structured results and `mcp-outputs/` for individual tool logs.
- If the ecohub-qa handshake fails, restart via `./ecohub-start.sh`, confirm `node -v` matches the repo’s expected version, then rerun the health check.
- Persistent failures usually mean MCP dependencies are missing—rerun `pnpm install` in each MCP tool folder and retry.
