## MCP Servers Overview (EcoHub Kosova)

| Server                       | Purpose                                       | Key tools/capabilities                                                                            | Start command                                               |
| ---------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| mcp-context-server           | Repo structure + search                       | project_map, code_search, read_files                                                              | `node tools/mcp-context-server/dist/server.js`              |
| ecohub-qa                    | Build/Lint/TS health                          | build_health                                                                                      | `node tools/ecohub-qa/dist/index.js`                        |
| context7                     | Semantic code/doc context                     | resolve-library-id, get-library-docs                                                              | `npx context7-mcp`                                          |
| playwright                   | Browser/E2E automation (accessibility-driven) | browser_navigate, browser_click, browser_fill_form, browser_pdf_save, browser_verify_text_visible | `npx mcp-server-playwright`                                 |
| markitdown                   | Doc → Markdown converter (Python)             | convert_to_markdown                                                                               | `markitdown-mcp --http --port 3001` (pipx install required) |
| mcp-db-schema (planned)      | DB schema helper                              | describe_schema, sample_queries, explain_query                                                    | TODO (not implemented)                                      |
| mcp-db-inspect (planned)     | Read-only SQL                                 | run_readonly_sql                                                                                  | TODO (not implemented)                                      |
| mcp-test-runner (planned)    | Test orchestration                            | run_unit, run_e2e                                                                                 | TODO (not implemented)                                      |
| mcp-docs-knowledge (planned) | Docs lookup                                   | list_docs, search_docs, get_doc                                                                   | TODO (not implemented)                                      |
| mcp-ux-assets (planned)      | UX catalog                                    | list_assets, component_catalog                                                                    | TODO (not implemented)                                      |

### Logical tool mapping (current)

- DB tools (`mcp-db-schema`, `mcp-db-inspect`) → context7 (until a dedicated DB MCP exists)
- Tests (`mcp-test-runner`) → ecohub-qa
- Docs/knowledge (`mcp-docs-knowledge`) → context7 (+ markitdown for doc conversion)
- UX/assets (`mcp-ux-assets`) → context7

### How to start everything

- MCP stack only: `./run-mcp-tools.sh` (logs in `logs/mcp/`)
- Next.js + MCP: `pnpm dev:all` (runs Next dev + MCP helper)
- Orchestrator snapshot + prompts: `pnpm dev:orchestrator` (writes `logs/mcp-health.json`, refreshed prompts in `prompts/`)

### MarkItDown installation (Python)

MarkItDown MCP is not bundled with Node deps. Install via:

```bash
pipx install markitdown-mcp
# optional extras for broader format support
pipx inject markitdown-mcp 'markitdown[all]'
```

The server listens on STDIO by default; `--http --port 3001` runs SSE/HTTP transport.

### Genkit Gemini Flow (Direct API Integration)

This project includes a direct integration with the Gemini API using Genkit. This provides a way to interact with the Gemini model directly, without relying on the prompt-based workflow.

**To run the Gemini flow:**

```bash
pnpm flow:gemini
```

This will start an interactive prompt that asks for your input. The flow will then send the prompt to the Gemini API and print the response.

**Prerequisites:**

- You must have a `GEMINI_API_KEY` set in your `.env.local` file.
- The `@genkit-ai/google-genai` package must be installed.
