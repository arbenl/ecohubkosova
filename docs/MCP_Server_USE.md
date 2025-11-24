Perfect 😄 Here’s a ready-to-drop file for your repo:

# MCP_CHEAT_SHEET.md
# EcoHub Kosova – MCP Cheat Sheet

This file explains **how to use all MCP-backed tools** in the EcoHub monorepo via the Node CLI wrapper.

---

## 🔑 How to call MCP tools

From the EcoHub root:

```bash
cd /Users/arbenlila/development/ecohubkosova

# General pattern
node tools/run-mcp-task.js <toolName> '<jsonArgs>'

Examples:

node tools/run-mcp-task.js project_map '{}'
node tools/run-mcp-task.js code_search '{ "query": "eco_listings" }'


⸻

1️⃣ Repo & Code Structure (mcp-context-server)

Logical tools:
	•	project_map – high-level file tree
	•	code_search – find usages/call sites
	•	read_files – inspect code before editing

Use for:
	•	“Where is X defined?”
	•	“Who calls this?”
	•	“Show me this file before I change it.”

When to use:
	•	Before any refactor or new feature.
	•	Before touching marketplace, partners, workspace, or auth flows.

Examples:

# Overview of repo structure
node tools/run-mcp-task.js project_map '{}'

# Find all references to marketplace V2
node tools/run-mcp-task.js code_search '{ "query": "eco_listings" }'

# Inspect specific files before changing them
node tools/run-mcp-task.js read_files '{
  "paths": [
    "src/services/listings.ts",
    "src/app/[locale]/(site)/marketplace/marketplace-client-page.tsx",
    "src/app/[locale]/(site)/partners/page.tsx"
  ]
}'


⸻

2️⃣ Database & Data Model (context7 → db_schema / db_inspect)

Logical tools:
	•	db_schema – inspect live DB schema (tables/columns/indexes)
	•	db_inspect – run focused SQL diagnostics

Use for:
	•	Schema questions.
	•	Foreign keys / relationships.
	•	Real data checks (counts, nulls, mismatches).

When to use:
	•	Before any migration.
	•	Before changing queries or services.
	•	When marketplace/partners/workspace data looks wrong.

Examples:

# Overview of tables/columns
node tools/run-mcp-task.js db_schema '{}'

# Inspect organizations contact info
node tools/run-mcp-task.js db_inspect '{
  "sql": "SELECT id, name, contact_email, contact_phone, contact_website FROM organizations LIMIT 20;"
}'

# Check V2 vs legacy listings
node tools/run-mcp-task.js db_inspect '{
  "sql": "SELECT COUNT(*) AS eco_listings_count FROM eco_listings;"
}'
node tools/run-mcp-task.js db_inspect '{
  "sql": "SELECT COUNT(*) AS tregu_v1_count FROM tregu_listime;"
}'


⸻

3️⃣ QA, Build & Tests (ecohub-qa)

Logical tools:
	•	build_health – lint + typecheck + build
	•	test_runner – run focused test suites (when wired)

Use for:
	•	“Did I break anything?”
	•	“Run tests around this feature.”

When to use:
	•	After every non-trivial code or schema change.
	•	Before cutting a release or “launch-ready” snapshot.

Examples:

# Full health check
node tools/run-mcp-task.js build_health '{}'

# Focused suites (if configured inside ecohub-qa)
node tools/run-mcp-task.js test_runner '{ "suite": "marketplace" }'
node tools/run-mcp-task.js test_runner '{ "suite": "workspace" }'
node tools/run-mcp-task.js test_runner '{ "suite": "partners" }'


⸻

4️⃣ Documentation & UX / Copy (context7: docs_knowledge, ux_assets)

Logical tools:
	•	docs_knowledge – pull relevant EcoHub docs (architecture, audits, migrations, specs)
	•	ux_assets – UX patterns, copy, layout guidance

Use for:
	•	Understanding how V2 was designed.
	•	Reusing wording / components so new UI feels native.
	•	Static pages: “How it works”, “Partners”, workspace copy.

When to use:
	•	Before adding/changing UI or flows.
	•	Always for partners, marketplace, workspace, and static informational pages.

Examples:

# Get architectural/functional context
node tools/run-mcp-task.js docs_knowledge '{
  "topic": "marketplace v2, partners v2, workspace v2"
}'

# Get UX patterns for dashboards/workspaces
node tools/run-mcp-task.js ux_assets '{
  "area": "dashboard",
  "style": "eco, clean, V2"
}'

# Database audit / migration context
node tools/run-mcp-task.js docs_knowledge '{
  "topic": "database audit 2025-11-24"
}'


⸻

5️⃣ E2E / Browser Automation (playwright MCP)

Logical tool:
	•	playwright (via MCP; details in docs/mcp-servers.md)

Use for:
	•	URL-level sanity checks.
	•	Eventually: scripted flows (login, create listing, view partner).

For now you’ll mostly use the repo helpers:

./run-e2e-tests.sh
# or
pnpm test:e2e


⸻

6️⃣ Markitdown / External Docs (markitdown MCP – optional)

Logical tool:
	•	markitdown (once installed via pipx)

Use for:
	•	Converting external HTML/PDF/Docx (e.g. recycling reports, donor docs) into markdown.
	•	Feeding those texts into docs_knowledge / UX flows.

(See docs/mcp-servers.md for exact wiring once enabled.)

⸻

7️⃣ MCP-First Rules for All Models

For Gemini, Claude, Sonnet, ChatGPT, Grok, Codex CLI (via their bootstrap prompts):
	1.	Start with repo + docs
	•	project_map, code_search, read_files
	•	docs_knowledge, ux_assets
	2.	If DB-related
	•	db_schema, db_inspect
	3.	After edits
	•	build_health
	•	test_runner (if suite exists)
	4.	Reasoning must reference MCP outputs
	•	Mention which tools ran and what they returned:
	•	Files found via project_map
	•	Matches from code_search
	•	Concrete code from read_files
	•	DB information from db_schema / db_inspect
	•	QA status from build_health / test_runner

⸻

8️⃣ Quick “Launch-Day” Routine

When you’re close to a release / big demo:

# 1) Start everything
./ecohub-start.sh

# 2) Check MCP & build health (auto in orchestrator)
pnpm dev:orchestrator

# 3) Manual smoke tests:
#    - /[locale]/marketplace
#    - /[locale]/partners
#    - /[locale]/my
#    - /[locale]/my/organization
#    - /[locale]/admin

# 4) Run E2E if time permits
./run-e2e-tests.sh

EcoHub is now fully wired to use MCP as “x-ray goggles” for code + DB + UX.
Whenever you call an AI model for help, make sure its bootstrap prompt tells it to go through these tools first.

You can save this as `MCP_CHEAT_SHEET.md` in the repo root (same level as `README.md`).