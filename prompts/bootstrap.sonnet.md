# EcoHub Kosova – Dev Bootstrap & Context

## Environment First (MCP + build health)

Before any work in a new session, run:

```bash
./scripts/check-mcp-health.sh
# or, if already in a shell:
node tools/run-mcp-task.js build_health '{}'
```

Confirm MCP servers are running via `mcp-outputs/mcp-health.json` or the CLI output, then proceed with MCP tools.

**Current Status Snapshot** (2025-11-24T16:58:31.292Z):
✅ Supabase reachable (eco_listings: 10, eco_organizations: 20)

- Lint: ✅ PASS
- TypeScript: ✅ PASS
- Build: ❌ FAIL
- MCP: mcp-context-server → mcp-context-server : OK (running) | ecohub-qa → ecohub-qa : OK (running) | mcp-db-schema → context7 : OK (running) | mcp-db-inspect → context7 : OK (running) | mcp-test-runner → ecohub-qa : OK (running) | mcp-docs-knowledge → context7 : OK (running) | mcp-ux-assets → context7 : OK (running) (log: logs/mcp-health.json)

---

## 1. Architecture Overview

EcoHub Kosova is a **Next.js 16 App Router** + **Supabase Postgres** + **Drizzle ORM** + **next-intl** application.

### Key Architectural Principles

1. **Marketplace V2 is the ONLY source of truth**
   - New schema: `eco_listings`, `eco_categories`, `eco_organizations`, `eco_listing_media`, `eco_listing_interactions`
   - Schema defined in: `src/db/schema/marketplace-v2.ts`
   - Enums: `src/db/schema/enums.ts`
   - V1 legacy table `tregu_listime` must NOT be used for new features
   - UI lives under `app/[locale]/(site)/marketplace/`

2. **Service Layer is the Single Source of Data Access**
   - All DB queries go through `src/services/**`
   - No direct Supabase client instantiation in routes or components
   - Services enforce validation, filtering, pagination, and security
   - Key modules:
     - `src/services/listings.ts` – marketplace data & filtering
     - `src/services/profile.ts` – user profile & organization membership
     - `src/services/organizations.ts` – eco-organization lookups
     - `src/services/auth.ts` – shared auth helpers (sign-out, session validation)
     - `src/services/admin/**` – admin CRUD & stats (centralized for web + React Native)

3. **Security & Auth**
   - Centralized admin checks in `lib/auth/roles.ts` via `requireAdminRole()`
   - All sensitive server actions verify canonical `users` record + Supabase RLS
   - Session versioning enforces single-browser sign-in (see `supabase-connection.md`)
   - Auth flows reuse shared Zod validators from `src/validation/auth.ts`

4. **Supabase Connection**
   - Connection pooler host: `aws-1-eu-west-1.pooler.supabase.com:6543`
   - Always verify `SUPABASE_DB_URL` points to pooler port 6543 (NOT 5432)
   - Migrations stored in `supabase/migrations/**`; use `pnpm db:sync` to push
   - See `docs/supabase-connection.md` for detailed troubleshooting

---

## 2. MCP tools you MUST use

- **First:** run `./scripts/check-mcp-health.sh` (or `node tools/run-mcp-task.js build_health '{}'`) to populate `mcp-outputs/mcp-health.json` and confirm servers are ready.
- **Current MCP health:** mcp-context-server → mcp-context-server : OK (running) | ecohub-qa → ecohub-qa : OK (running) | mcp-db-schema → context7 : OK (running) | mcp-db-inspect → context7 : OK (running) | mcp-test-runner → ecohub-qa : OK (running) | mcp-docs-knowledge → context7 : OK (running) | mcp-ux-assets → context7 : OK (running). See `logs/mcp-health.json` for details.
- **Contract:** `docs/mcp-contract.json`
- **Servers & methods**
  - **mcp-context-server:** `project_map`, `code_search`, `read_files`
  - **ecohub-qa:** `build_health`
  - **context7:** `resolve-library-id`, `get-library-docs` (semantic code/doc context)
  - **playwright:** browser automation & assertions (core/vision/pdf/testing tools)
  - **markitdown:** `convert_to_markdown` (docs → Markdown)
  - **DB tools (mapped to context7):** `mcp-db-schema` (`describe_schema`, `sample_queries`, `explain_query`), `mcp-db-inspect` (`run_readonly_sql`)
  - **Tests (mapped to ecohub-qa):** `mcp-test-runner` (`run_unit`, `run_e2e`)
  - **Docs/knowledge (mapped to context7/markitdown):** `mcp-docs-knowledge` (`list_docs`, `search_docs`, `get_doc`)
  - **UX/assets (mapped to context7):** `mcp-ux-assets` (`list_assets`, `component_catalog`) (optional/planned)

### Default workflow (with MCP)

1. `project_map` → understand structure (mcp-context-server)
2. `code_search` → find modules/routes/services (mcp-context-server) and use **context7** for semantic/embedding lookups
3. `read_files` → inspect real code before proposing changes
4. Docs via **mcp-docs-knowledge** and **markitdown** for converting external PDFs/DOCX/etc. to Markdown
5. DB via **mcp-db-schema** + **mcp-db-inspect** (schema, sample queries, read-only checks)
6. Browser/E2E via **playwright** (smoke journeys, accessibility tree interactions)
7. Implement minimal, safe changes (prefer service layer)
8. Validate: **ecohub-qa.build_health** and **mcp-test-runner** (`run_unit`, `run_e2e`)
9. Summarize: list files changed, note MCP tools used, surface any remaining failures

### If you do NOT have MCP tools (Gemini/Grok/Codex CLI)

- Ask for `mcp-outputs/*.log` (including `logs/mcp-health.json`) and relevant `docs/*.md`
- Do not guess paths or imports—base reasoning on the provided logs/docs
- Request fresh `pnpm lint && pnpm tsc --noEmit && pnpm build` output after your suggestions

---

## 3. Development Workflow

### Starting a New Dev Session

1. **Run the orchestrator to refresh all context:**
   ```bash
   pnpm dev:orchestrator
   ```
   This generates fresh logs in `mcp-outputs/` and refreshes prompts in `prompts/`.

2. **Copy the appropriate prompt into your AI model:**
   - Claude Sonnet/Haiku → `prompts/bootstrap.claude.md`
   - ChatGPT GPT-5.1 Thinking → `prompts/bootstrap.chatgpt.md`
   - Gemini 3.0 Pro → `prompts/bootstrap.gemini.md`
   - Grok → `prompts/bootstrap.grok.md`
   - Codex CLI → `prompts/bootstrap.codex-cli.md`
   - Sonnet (dedicated) → `prompts/bootstrap.sonnet.md`

3. **Paste the entire prompt into your model as the first message** before giving it any task.

### During Development

- **Before touching files:** Always use MCP tools (if available) to `project_map`, `code_search`, and `read_files`
- **After big changes:** Run `pnpm lint && pnpm tsc --noEmit && pnpm build` locally and report results
- **For marketplace changes:** Always verify you're editing files under `app/[locale]/(site)/marketplace/` and schema under `src/db/schema/marketplace-v2.ts`
- **For API routes:** Ensure they call services from `src/services/**`, not Supabase directly

---

## 4. Key File Reference

| Path | Purpose |
| --- | --- |
| `src/db/schema/marketplace-v2.ts` | V2 marketplace tables (eco_listings, eco_categories, etc.) |
| `src/db/schema/enums.ts` | Shared enums (listing flow types, conditions, statuses) |
| `src/services/listings.ts` | Marketplace query & filter service |
| `src/services/profile.ts` | User profile & org membership lookups |
| `src/services/organizations.ts` | Eco-organization service |
| `src/services/admin/**` | Admin CRUD & stats helpers |
| `src/app/[locale]/(site)/marketplace/page.tsx` | Server root for marketplace |
| `src/app/[locale]/(site)/marketplace/marketplace-client-page.tsx` | Client-side marketplace UI |
| `src/components/marketplace-v2/` | V2 marketplace UI components |
| `docs/supabase-connection.md` | Supabase pooler setup & troubleshooting |
| `docs/database-migrations.md` | Migration workflow via `supabase cli` |
| `supabase/migrations/` | Actual SQL migrations |

---

## 5. Common Tasks & Quick Refs

### Add a New Marketplace Listing Programmatically

Use `src/services/listings.ts` or the `app/[locale]/marketplace/actions.ts` server action. Never insert directly into `eco_listings`; always validate & use services.

### Query Marketplace Data

1. Import from `src/services/listings`
2. Call `fetchListings()` with filters (category, location, flow_type, etc.)
3. Never call `db.get().select().from(ecoListings)` directly in components

### Update Admin Stats

Call `src/services/admin/stats.ts`; it returns aggregated counts and insights. Web + future React Native clients both use this single source.

### Debug Supabase Connection

1. Verify `SUPABASE_DB_URL` points to pooler: `echo $SUPABASE_DB_URL`
2. Test connectivity: `ecohub_supabase_ping` or `psql "$SUPABASE_DB_URL" -c '\dt'`
3. Check migrations: `supabase migration list`
4. If stuck, see `docs/supabase-connection.md` Troubleshooting table

---

## 6. When in Doubt

1. **Is this a marketplace feature?** → Always use Marketplace V2 schema + `src/services/listings.ts`
2. **Do I need user data?** → Go through `src/services/profile.ts`, not Supabase client directly
3. **Is this an admin feature?** → Call `src/services/admin/**`, verify role via `requireAdminRole()`
4. **Did I make a file change?** → Run `pnpm lint && pnpm tsc --noEmit` to validate
5. **Is Supabase unreachable?** → Check network, verify pooler host, restart dev server

---

## 7. Next Steps

- Run `pnpm dev` to start the dev server
- Ensure MCP servers are running (they start with `pnpm dev` or your MCP launcher)
- Use the model-specific prompt bundle from `prompts/` for your AI model
- Ask your AI to inspect files via MCP tools before making changes
- Report any blockers or unclear architecture to me


---

## Claude Sonnet Instructions

You have **MCP tools**. Follow the mandatory workflow:
- `project_map` → `code_search` → `read_files` for any task
- Semantic lookups via **context7** (deep code/doc search)
- Docs via **mcp-docs-knowledge** and **markitdown** for doc → Markdown; DB via **mcp-db-schema** + **mcp-db-inspect**
- Browser/E2E via **playwright** (smoke flows, accessibility-tree driven actions)
- Validation via **ecohub-qa.build_health** and **mcp-test-runner** (`run_unit`, `run_e2e`)
- UX consistency via **mcp-ux-assets** when modifying UI
- Logical mapping: DB tools (`mcp-db-schema`, `mcp-db-inspect`) run on **context7**; tests (`mcp-test-runner`) run on **ecohub-qa**; docs/UX (`mcp-docs-knowledge`, `mcp-ux-assets`) run on **context7** (+ **markitdown** for docs).
- MCP health snapshot: `mcp-outputs/mcp-health.json`

### Guardrails

- Marketplace V2 is the public surface; V1 tables are legacy-only
- Keep data access inside `src/services/**`; enforce admin via `requireAdminRole()`
- Prefer incremental changes with strict types; avoid guessing imports or paths
- Run or request lint/tsc/build after meaningful edits

### Reporting

- List the MCP calls you used
- Summarize files changed and any remaining failing checks (if any)

Good luck! 🚀
