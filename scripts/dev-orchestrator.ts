#!/usr/bin/env node
/**
 * EcoHub Dev Orchestrator & Multi-Model Bootstrap
 *
 * Purpose:
 * - Verify Supabase connectivity and capture DB health snapshots
 * - Ensure MCP servers are running
 * - Run QA checks (lint, tsc, build)
 * - Generate multi-model prompt bundles for Claude, ChatGPT, Gemini, Grok, Codex CLI
 *
 * Usage:
 *   pnpm dev:orchestrator
 */

import fs from "fs"
import path from "path"
import { execSync, spawn } from "child_process"
import * as readline from "readline"

// ============================================================================
// CONFIGURATION
// ============================================================================

const PROJECT_ROOT = path.resolve(__dirname, "..")
const OUTPUTS_DIR = path.join(PROJECT_ROOT, "mcp-outputs")
const PROMPTS_DIR = path.join(PROJECT_ROOT, "prompts")
const DOCS_DIR = path.join(PROJECT_ROOT, "docs")
const LOGS_DIR = path.join(PROJECT_ROOT, "logs")
const MCP_HEALTH_FILENAME = "mcp-health.json"

const REQUIRED_MCP_SERVERS = [
  "mcp-context-server",
  "ecohub-qa",
  "mcp-db-schema",
  "mcp-db-inspect",
  "mcp-test-runner",
  "mcp-docs-knowledge",
  "mcp-ux-assets",
] as const

const MCP_SERVER_MAP: Record<(typeof REQUIRED_MCP_SERVERS)[number], string> = {
  "mcp-context-server": "mcp-context-server",
  "ecohub-qa": "ecohub-qa",
  // Map DB logical tools to context7 for now (semantic DB doc lookup) until dedicated DB MCP exists.
  "mcp-db-schema": "context7",
  "mcp-db-inspect": "context7",
  // Tests leverage ecohub-qa until a dedicated runner MCP is available.
  "mcp-test-runner": "ecohub-qa",
  // Docs/UX assets use context7 (and markitdown) for knowledge lookups.
  "mcp-docs-knowledge": "context7",
  "mcp-ux-assets": "context7",
}

// Ensure output directories exist
for (const dir of [OUTPUTS_DIR, PROMPTS_DIR, LOGS_DIR]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

// ============================================================================
// UTILITIES
// ============================================================================

function log(message: string) {
  console.log(`[DEV-ORCHESTRATOR] ${message}`)
}

function logSuccess(message: string) {
  console.log(`✅ ${message}`)
}

function logError(message: string) {
  console.error(`❌ ${message}`)
}

function logInfo(message: string) {
  console.log(`ℹ️  ${message}`)
}

function writeLog(filename: string, content: string, directory: string = OUTPUTS_DIR) {
  const filepath = path.join(directory, filename)
  fs.writeFileSync(filepath, content, "utf-8")
  logInfo(`Wrote ${path.relative(PROJECT_ROOT, filepath)}`)
}

function readDocIfExists(docName: string): string {
  const docPath = path.join(DOCS_DIR, docName)
  if (fs.existsSync(docPath)) {
    return fs.readFileSync(docPath, "utf-8")
  }
  return ""
}

type McpServerStatus = "running" | "available" | "missing" | "not-implemented"

interface McpServerConfig {
  name: string
  binaryHint?: string
  optional?: boolean
  implemented: boolean
  description?: string
  commandHint?: string
}

interface McpServerHealth {
  name: string
  logicalName?: string
  underlyingName?: string
  status: McpServerStatus
  ok: boolean
  implemented: boolean
  optional?: boolean
  binaryFound: boolean
  processDetected: boolean
  message: string
  commandHint?: string
}

interface McpHealthSnapshot {
  allHealthy: boolean
  availableCount: number
  healthyCount: number
  runningCount: number
  servers: McpServerHealth[]
  summary: string
  timestamp: string
}

const MCP_SERVERS: McpServerConfig[] = [
  {
    name: "mcp-context-server",
    binaryHint: path.join(PROJECT_ROOT, "tools", "mcp-context-server", "dist", "server.js"),
    implemented: true,
    description: "Code navigation (project_map/code_search/read_files)",
  },
  {
    name: "ecohub-qa",
    binaryHint: path.join(PROJECT_ROOT, "tools", "ecohub-qa", "dist", "index.js"),
    implemented: true,
    description: "QA audits (build_health + diagnostics)",
  },
  {
    name: "context7",
    binaryHint: path.join(PROJECT_ROOT, "node_modules", ".bin", "context7-mcp"),
    commandHint: "npx context7-mcp",
    implemented: true,
    description: "Embeddings-backed code/doc context (resolve-library-id/get-library-docs)",
  },
  {
    name: "playwright",
    binaryHint: path.join(PROJECT_ROOT, "node_modules", ".bin", "mcp-server-playwright"),
    commandHint: "npx mcp-server-playwright",
    implemented: true,
    description: "Browser/E2E automation via Playwright MCP",
  },
  {
    name: "markitdown",
    commandHint: "markitdown-mcp --http --port 3001",
    implemented: true,
    optional: true,
    description: "Document → Markdown converter (convert_to_markdown) via Python pipx install",
  },
  {
    name: "mcp-db-schema",
    implemented: false,
    optional: true,
    description: "Planned: DB schema helper (describe_schema/sample_queries/explain_query)",
  },
  {
    name: "mcp-db-inspect",
    implemented: false,
    optional: true,
    description: "Planned: Read-only SQL inspector (run_readonly_sql)",
  },
  {
    name: "mcp-test-runner",
    implemented: false,
    optional: true,
    description: "Planned: Test runner (run_unit/run_e2e)",
  },
  {
    name: "mcp-docs-knowledge",
    implemented: false,
    optional: true,
    description: "Planned: Docs search (list_docs/search_docs/get_doc)",
  },
  {
    name: "mcp-ux-assets",
    implemented: false,
    optional: true,
    description: "Planned: UX assets catalog (list_assets/component_catalog)",
  },
]

// ============================================================================
// STEP 1: CHECK SUPABASE CONNECTIVITY
// ============================================================================

async function checkSupabaseConnectivity(): Promise<{
  reachable: boolean
  ecoListingsCount: number
  ecoOrganizationsCount: number
  timestamp: string
}> {
  log("Checking Supabase connectivity...")

  const result = {
    reachable: false,
    ecoListingsCount: 0,
    ecoOrganizationsCount: 0,
    timestamp: new Date().toISOString(),
  }

  try {
    // Get SUPABASE_DB_URL from environment
    const dbUrl = process.env.SUPABASE_DB_URL
    if (!dbUrl) {
      logError("SUPABASE_DB_URL not set in environment")
      return result
    }

    // Try a simple count query using psql via pnpm dlx supabase
    try {
      const query = `
        SELECT 
          (SELECT COUNT(*) FROM eco_listings) as eco_listings_count,
          (SELECT COUNT(*) FROM eco_organizations) as eco_organizations_count;
      `

      const output = execSync(
        `PGCONNECT_TIMEOUT=5 psql "${dbUrl}" -c "${query.replace(/\n/g, " ")}" --tuples-only`,
        {
          encoding: "utf-8",
          stdio: ["pipe", "pipe", "pipe"],
        }
      )

      // Parse output (format: "count1 | count2")
      const match = output.trim().match(/(\d+)\s*\|\s*(\d+)/)
      if (match) {
        result.reachable = true
        result.ecoListingsCount = parseInt(match[1], 10)
        result.ecoOrganizationsCount = parseInt(match[2], 10)
        logSuccess(
          `Supabase reachable (eco_listings: ${result.ecoListingsCount}, eco_organizations: ${result.ecoOrganizationsCount})`
        )
      }
    } catch {
      logError("Failed to query Supabase directly; trying via psql alias...")
      // Try the ecohub_supabase_ping alias
      try {
        execSync(`ecohub_supabase_ping`, {
          encoding: "utf-8",
          stdio: "inherit",
        })
        result.reachable = true
        logInfo("Supabase ping succeeded; counts will be fetched on next full run")
      } catch {
        logError("Both direct query and alias ping failed")
      }
    }
  } catch (err) {
    logError(`Supabase check error: ${err instanceof Error ? err.message : String(err)}`)
  }

  return result
}

// ============================================================================
// STEP 2: CHECK MCP SERVERS
// ============================================================================

async function checkMcpHealth(): Promise<McpHealthSnapshot> {
  log("Checking MCP servers...")

  let processList = ""
  try {
    processList = execSync("ps aux", { encoding: "utf-8" }).toLowerCase()
  } catch {
    logInfo("MCP process scan unavailable; falling back to binary hints only")
  }

  const physicalMap = new Map(MCP_SERVERS.map((cfg) => [cfg.name, cfg]))

  const resolveBinary = (config: McpServerConfig): { binaryFound: boolean; commandHint?: string } => {
    let binaryFound = config.binaryHint ? fs.existsSync(config.binaryHint) : false
    let commandHint =
      config.commandHint ||
      (config.binaryHint && config.implemented ? `node ${path.relative(PROJECT_ROOT, config.binaryHint)}` : undefined)

    if (!binaryFound && commandHint && !commandHint.startsWith("npx ")) {
      try {
        const cmd = commandHint.split(" ")[0]
        const resolved = execSync(`command -v ${cmd}`, { encoding: "utf-8" }).trim()
        binaryFound = resolved.length > 0
      } catch {
        binaryFound = false
      }
    }

    return { binaryFound, commandHint }
  }

  const pingServer = (config: McpServerConfig, commandHint?: string): { ok: boolean; message?: string } => {
    if (!commandHint) return { ok: false }
    const helpCommand = `${commandHint} --help`
    try {
      execSync(helpCommand, {
        cwd: PROJECT_ROOT,
        encoding: "utf-8",
        stdio: "pipe",
        timeout: 1500,
        shell: "bash",
      })
      return { ok: true, message: "Ping ok (--help)" }
    } catch (err) {
      return {
        ok: false,
        message: `Ping failed${err instanceof Error ? `: ${err.message.split("\\n")[0]}` : ""}`,
      }
    }
  }

  const physicalHealth: McpServerHealth[] = MCP_SERVERS.map((config) => {
    const { binaryFound, commandHint } = resolveBinary(config)
    const processDetected = processList ? processList.includes(config.name.toLowerCase()) : false

    let status: McpServerStatus = "not-implemented"
    if (config.implemented) {
      if (processDetected) {
        status = "running"
      } else if (binaryFound) {
        status = "available"
      } else {
        status = "missing"
      }
    }

    let ok = config.implemented ? status === "running" : false
    let message = config.description || ""
    if (!config.implemented) {
      message = "Not implemented in this repo (planned/TODO)"
    } else if (status === "running") {
      message = "Process detected"
    } else if (status === "available") {
      const ping = pingServer(config, commandHint)
      if (ping.ok) {
        message = ping.message || "Binary found; ping ok"
        ok = true
        status = "available"
      } else {
        message = ping.message || (commandHint ? `Binary found; start with "${commandHint}"` : "Binary found; start server")
      }
    } else if (status === "missing") {
      message = "Binary not found"
    }

    return {
      name: config.name,
      status,
      ok,
      implemented: config.implemented,
      optional: config.optional,
      binaryFound,
      processDetected,
      message,
      commandHint,
    }
  })

  const logicalHealth: McpServerHealth[] = REQUIRED_MCP_SERVERS.map((logicalName) => {
    const physicalName = MCP_SERVER_MAP[logicalName]
    const physical = physicalMap.get(physicalName)
    const fallback: McpServerHealth = {
      name: physicalName,
      logicalName,
      underlyingName: physicalName,
      status: "missing",
      ok: false,
      implemented: false,
      binaryFound: false,
      processDetected: false,
      message: "No server config found",
    }

    if (!physical) return fallback

    const health = physicalHealth.find((h) => h.name === physicalName)
    if (!health) return fallback

    return {
      ...health,
      logicalName,
      underlyingName: physicalName,
      optional: physical.optional,
    }
  })

  const requiredLogical = logicalHealth.filter((s) => !s.optional)
  const runningCount = requiredLogical.filter((s) => s.ok).length
  const summaryParts = logicalHealth.map(
    (s) => `${s.logicalName} → ${s.underlyingName} : ${s.ok ? "OK" : "DOWN"} (${s.status})`
  )

  return {
    allHealthy: runningCount === requiredLogical.length,
    availableCount: logicalHealth.filter((s) => s.status === "running" || s.status === "available").length,
    healthyCount: runningCount,
    runningCount,
    servers: logicalHealth,
    summary: summaryParts.join(" | "),
    timestamp: new Date().toISOString(),
  }
}

// ============================================================================
// STEP 3: RUN BUILD HEALTH CHECKS
// ============================================================================

async function runBuildHealthChecks(): Promise<{
  lint: { pass: boolean; output: string }
  tsc: { pass: boolean; output: string }
  build: { pass: boolean; output: string }
  timestamp: string
}> {
  log("Running build health checks...")

  const result = {
    lint: { pass: false, output: "" },
    tsc: { pass: false, output: "" },
    build: { pass: false, output: "" },
    timestamp: new Date().toISOString(),
  }

  // Lint check
  try {
    const output = execSync("pnpm lint 2>&1", {
      cwd: PROJECT_ROOT,
      encoding: "utf-8",
    })
    result.lint = { pass: true, output: output.slice(0, 500) }
    logSuccess("Lint check passed")
  } catch (err) {
    result.lint = {
      pass: false,
      output: err instanceof Error ? err.message.slice(0, 500) : String(err),
    }
    logError("Lint check failed")
  }

  // TypeScript check
  try {
    const output = execSync("pnpm tsc --noEmit 2>&1", {
      cwd: PROJECT_ROOT,
      encoding: "utf-8",
    })
    result.tsc = { pass: true, output: output.slice(0, 500) }
    logSuccess("TypeScript check passed")
  } catch (err) {
    result.tsc = {
      pass: false,
      output: err instanceof Error ? err.message.slice(0, 500) : String(err),
    }
    logError("TypeScript check failed")
  }

  // Build check (quick preview)
  try {
    const output = execSync("set -o pipefail; pnpm build 2>&1 | tail -20", {
      cwd: PROJECT_ROOT,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
      shell: "bash",
    })
    result.build = { pass: true, output: output.slice(0, 500) }
    logSuccess("Build check passed")
  } catch (err) {
    result.build = {
      pass: false,
      output: err instanceof Error ? err.message.slice(0, 500) : String(err),
    }
    logError("Build check failed or incomplete")
  }

  return result
}

// ============================================================================
// STEP 4: READ CORE DOCUMENTATION
// ============================================================================

function readCoreDocs(): {
  devBootstrap: string
  supabaseConnection: string
  architecture: string
  dataLayer: string
  marketplaceV2: string
} {
  log("Reading core documentation...")

  return {
    devBootstrap: readDocIfExists("dev-bootstrap-prompts.md"),
    supabaseConnection: readDocIfExists("supabase-connection.md"),
    architecture: readDocIfExists("architecture-plan.md"),
    dataLayer: readDocIfExists("data-layer-review.md"),
    marketplaceV2: readDocIfExists("marketplace-v2-tutorial-sq.md"),
  }
}

// ============================================================================
// STEP 5: GENERATE MULTI-MODEL PROMPTS
// ============================================================================

interface QASnapshot {
  supabaseStatus: {
    reachable: boolean
    ecoListingsCount: number
    ecoOrganizationsCount: number
    timestamp: string
  }
  buildHealth: {
    lint: { pass: boolean; output: string }
    tsc: { pass: boolean; output: string }
    build: { pass: boolean; output: string }
    timestamp: string
  }
  mcpHealth: McpHealthSnapshot
}

function generateRootBootstrap(docs: ReturnType<typeof readCoreDocs>, qa: QASnapshot): string {
  const supabaseStatusLine = qa.supabaseStatus.reachable
    ? `✅ Supabase reachable (eco_listings: ${qa.supabaseStatus.ecoListingsCount}, eco_organizations: ${qa.supabaseStatus.ecoOrganizationsCount})`
    : `❌ Supabase not reachable`

  const buildStatusLine = `
- Lint: ${qa.buildHealth.lint.pass ? "✅ PASS" : "❌ FAIL"}
- TypeScript: ${qa.buildHealth.tsc.pass ? "✅ PASS" : "❌ FAIL"}
- Build: ${qa.buildHealth.build.pass ? "✅ PASS" : "❌ FAIL"}`

  const mcpHealthLogRef = `logs/${MCP_HEALTH_FILENAME}`
  const mcpStatusLine = qa.mcpHealth
    ? `- MCP: ${qa.mcpHealth.summary} (log: ${mcpHealthLogRef})`
    : "- MCP: not collected"

  return `# EcoHub Kosova – Dev Bootstrap & Context

**Current Status Snapshot** (${new Date().toISOString()}):
${supabaseStatusLine}
${buildStatusLine}
${mcpStatusLine}

---

## 1. Architecture Overview

EcoHub Kosova is a **Next.js 16 App Router** + **Supabase Postgres** + **Drizzle ORM** + **next-intl** application.

### Key Architectural Principles

1. **Marketplace V2 is the ONLY source of truth**
   - New schema: \`eco_listings\`, \`eco_categories\`, \`eco_organizations\`, \`eco_listing_media\`, \`eco_listing_interactions\`
   - Schema defined in: \`src/db/schema/marketplace-v2.ts\`
   - Enums: \`src/db/schema/enums.ts\`
   - V1 legacy table \`tregu_listime\` must NOT be used for new features
   - UI lives under \`app/[locale]/(site)/marketplace/\`

2. **Service Layer is the Single Source of Data Access**
   - All DB queries go through \`src/services/**\`
   - No direct Supabase client instantiation in routes or components
   - Services enforce validation, filtering, pagination, and security
   - Key modules:
     - \`src/services/listings.ts\` – marketplace data & filtering
     - \`src/services/profile.ts\` – user profile & organization membership
     - \`src/services/organizations.ts\` – eco-organization lookups
     - \`src/services/auth.ts\` – shared auth helpers (sign-out, session validation)
     - \`src/services/admin/**\` – admin CRUD & stats (centralized for web + React Native)

3. **Security & Auth**
   - Centralized admin checks in \`lib/auth/roles.ts\` via \`requireAdminRole()\`
   - All sensitive server actions verify canonical \`users\` record + Supabase RLS
   - Session versioning enforces single-browser sign-in (see \`supabase-connection.md\`)
   - Auth flows reuse shared Zod validators from \`src/validation/auth.ts\`

4. **Supabase Connection**
   - Connection pooler host: \`aws-1-eu-west-1.pooler.supabase.com:6543\`
   - Always verify \`SUPABASE_DB_URL\` points to pooler port 6543 (NOT 5432)
   - Migrations stored in \`supabase/migrations/**\`; use \`pnpm db:sync\` to push
   - See \`docs/supabase-connection.md\` for detailed troubleshooting

---

## 2. MCP tools you MUST use

- **Current MCP health:** ${qa.mcpHealth.summary}. See \`${mcpHealthLogRef}\` for details.
- **Contract:** \`docs/mcp-contract.json\`
- **Servers & methods**
  - **mcp-context-server:** \`project_map\`, \`code_search\`, \`read_files\`
  - **ecohub-qa:** \`build_health\`
  - **context7:** \`resolve-library-id\`, \`get-library-docs\` (semantic code/doc context)
  - **playwright:** browser automation & assertions (core/vision/pdf/testing tools)
  - **markitdown:** \`convert_to_markdown\` (docs → Markdown)
  - **DB tools (mapped to context7):** \`mcp-db-schema\` (\`describe_schema\`, \`sample_queries\`, \`explain_query\`), \`mcp-db-inspect\` (\`run_readonly_sql\`)
  - **Tests (mapped to ecohub-qa):** \`mcp-test-runner\` (\`run_unit\`, \`run_e2e\`)
  - **Docs/knowledge (mapped to context7/markitdown):** \`mcp-docs-knowledge\` (\`list_docs\`, \`search_docs\`, \`get_doc\`)
  - **UX/assets (mapped to context7):** \`mcp-ux-assets\` (\`list_assets\`, \`component_catalog\`) (optional/planned)

### Default workflow (with MCP)

1. \`project_map\` → understand structure (mcp-context-server)
2. \`code_search\` → find modules/routes/services (mcp-context-server) and use **context7** for semantic/embedding lookups
3. \`read_files\` → inspect real code before proposing changes
4. Docs via **mcp-docs-knowledge** and **markitdown** for converting external PDFs/DOCX/etc. to Markdown
5. DB via **mcp-db-schema** + **mcp-db-inspect** (schema, sample queries, read-only checks)
6. Browser/E2E via **playwright** (smoke journeys, accessibility tree interactions)
7. Implement minimal, safe changes (prefer service layer)
8. Validate: **ecohub-qa.build_health** and **mcp-test-runner** (\`run_unit\`, \`run_e2e\`)
9. Summarize: list files changed, note MCP tools used, surface any remaining failures

### If you do NOT have MCP tools (Gemini/Grok/Codex CLI)

- Ask for \`mcp-outputs/*.log\` (including \`${mcpHealthLogRef}\`) and relevant \`docs/*.md\`
- Do not guess paths or imports—base reasoning on the provided logs/docs
- Request fresh \`pnpm lint && pnpm tsc --noEmit && pnpm build\` output after your suggestions

---

## 3. Development Workflow

### Starting a New Dev Session

1. **Run the orchestrator to refresh all context:**
   \`\`\`bash
   pnpm dev:orchestrator
   \`\`\`
   This generates fresh logs in \`mcp-outputs/\` and refreshes prompts in \`prompts/\`.

2. **Copy the appropriate prompt into your AI model:**
   - Claude Sonnet/Haiku → \`prompts/bootstrap.claude.md\`
   - ChatGPT GPT-5.1 Thinking → \`prompts/bootstrap.chatgpt.md\`
   - Gemini 3.0 Pro → \`prompts/bootstrap.gemini.md\`
   - Grok → \`prompts/bootstrap.grok.md\`
   - Codex CLI → \`prompts/bootstrap.codex-cli.md\`
   - Sonnet (dedicated) → \`prompts/bootstrap.sonnet.md\`

3. **Paste the entire prompt into your model as the first message** before giving it any task.

### During Development

- **Before touching files:** Always use MCP tools (if available) to \`project_map\`, \`code_search\`, and \`read_files\`
- **After big changes:** Run \`pnpm lint && pnpm tsc --noEmit && pnpm build\` locally and report results
- **For marketplace changes:** Always verify you're editing files under \`app/[locale]/(site)/marketplace/\` and schema under \`src/db/schema/marketplace-v2.ts\`
- **For API routes:** Ensure they call services from \`src/services/**\`, not Supabase directly

---

## 4. Key File Reference

| Path | Purpose |
| --- | --- |
| \`src/db/schema/marketplace-v2.ts\` | V2 marketplace tables (eco_listings, eco_categories, etc.) |
| \`src/db/schema/enums.ts\` | Shared enums (listing flow types, conditions, statuses) |
| \`src/services/listings.ts\` | Marketplace query & filter service |
| \`src/services/profile.ts\` | User profile & org membership lookups |
| \`src/services/organizations.ts\` | Eco-organization service |
| \`src/services/admin/**\` | Admin CRUD & stats helpers |
| \`src/app/[locale]/(site)/marketplace/page.tsx\` | Server root for marketplace |
| \`src/app/[locale]/(site)/marketplace/marketplace-client-page.tsx\` | Client-side marketplace UI |
| \`src/components/marketplace-v2/\` | V2 marketplace UI components |
| \`docs/supabase-connection.md\` | Supabase pooler setup & troubleshooting |
| \`docs/database-migrations.md\` | Migration workflow via \`supabase cli\` |
| \`supabase/migrations/\` | Actual SQL migrations |

---

## 5. Common Tasks & Quick Refs

### Add a New Marketplace Listing Programmatically

Use \`src/services/listings.ts\` or the \`app/[locale]/marketplace/actions.ts\` server action. Never insert directly into \`eco_listings\`; always validate & use services.

### Query Marketplace Data

1. Import from \`src/services/listings\`
2. Call \`fetchListings()\` with filters (category, location, flow_type, etc.)
3. Never call \`db.get().select().from(ecoListings)\` directly in components

### Update Admin Stats

Call \`src/services/admin/stats.ts\`; it returns aggregated counts and insights. Web + future React Native clients both use this single source.

### Debug Supabase Connection

1. Verify \`SUPABASE_DB_URL\` points to pooler: \`echo $SUPABASE_DB_URL\`
2. Test connectivity: \`ecohub_supabase_ping\` or \`psql "$SUPABASE_DB_URL" -c '\\dt'\`
3. Check migrations: \`supabase migration list\`
4. If stuck, see \`docs/supabase-connection.md\` Troubleshooting table

---

## 6. When in Doubt

1. **Is this a marketplace feature?** → Always use Marketplace V2 schema + \`src/services/listings.ts\`
2. **Do I need user data?** → Go through \`src/services/profile.ts\`, not Supabase client directly
3. **Is this an admin feature?** → Call \`src/services/admin/**\`, verify role via \`requireAdminRole()\`
4. **Did I make a file change?** → Run \`pnpm lint && pnpm tsc --noEmit\` to validate
5. **Is Supabase unreachable?** → Check network, verify pooler host, restart dev server

---

## 7. Next Steps

- Run \`pnpm dev\` to start the dev server
- Ensure MCP servers are running (they start with \`pnpm dev\` or your MCP launcher)
- Use the model-specific prompt bundle from \`prompts/\` for your AI model
- Ask your AI to inspect files via MCP tools before making changes
- Report any blockers or unclear architecture to me
`
}

function generateSonnetPrompt(
  rootBootstrap: string,
  docs: ReturnType<typeof readCoreDocs>
): string {
  return `${rootBootstrap}

---

## Claude Sonnet Instructions

You have **MCP tools**. Follow the mandatory workflow:
- \`project_map\` → \`code_search\` → \`read_files\` for any task
- Semantic lookups via **context7** (deep code/doc search)
- Docs via **mcp-docs-knowledge** and **markitdown** for doc → Markdown; DB via **mcp-db-schema** + **mcp-db-inspect**
- Browser/E2E via **playwright** (smoke flows, accessibility-tree driven actions)
- Validation via **ecohub-qa.build_health** and **mcp-test-runner** (\`run_unit\`, \`run_e2e\`)
- UX consistency via **mcp-ux-assets** when modifying UI
- Logical mapping: DB tools (\`mcp-db-schema\`, \`mcp-db-inspect\`) run on **context7**; tests (\`mcp-test-runner\`) run on **ecohub-qa**; docs/UX (\`mcp-docs-knowledge\`, \`mcp-ux-assets\`) run on **context7** (+ **markitdown** for docs).
- MCP health snapshot: \`mcp-outputs/${MCP_HEALTH_FILENAME}\`

### Guardrails

- Marketplace V2 is the public surface; V1 tables are legacy-only
- Keep data access inside \`src/services/**\`; enforce admin via \`requireAdminRole()\`
- Prefer incremental changes with strict types; avoid guessing imports or paths
- Run or request lint/tsc/build after meaningful edits

### Reporting

- List the MCP calls you used
- Summarize files changed and any remaining failing checks (if any)

Good luck! 🚀
`
}

function generateClaudePrompt(
  rootBootstrap: string,
  docs: ReturnType<typeof readCoreDocs>
): string {
  return `${rootBootstrap}

---

## Claude-Specific Instructions

You have **MCP tools** available in this conversation. Use them systematically:

1. **Always start with \`project_map\`** to see the repo structure
2. **Use \`code_search\`** to find relevant files by keyword
3. **Use \`read_files\`** to inspect actual code before proposing changes
4. **Base all suggestions ONLY on real code** – never invent file paths or imports
- **Context & Docs/Tests:** Use **context7** for semantic context, \`mcp-db-schema\` + \`mcp-db-inspect\` (mapped to context7) for schema/data, \`mcp-docs-knowledge\` + **markitdown** for docs (mapped to context7/markitdown), **playwright** for browser/E2E, \`mcp-test-runner\` (mapped to ecohub-qa) for validation, and \`mcp-ux-assets\` (mapped to context7) when touching UI. Check \`mcp-outputs/${MCP_HEALTH_FILENAME}\` for availability.

### Your Responsibilities

- Inspect \`src/db/schema/marketplace-v2.ts\` before touching any Marketplace V2 code
- Verify service layer usage in \`src/services/**\` – all data access must go there
- Ensure admin actions use \`requireAdminRole()\` from \`lib/auth/roles.ts\`
- After code changes, ask me to run: \`pnpm lint && pnpm tsc --noEmit && pnpm build\`
- If a path or import is unclear, search for it first – don't guess

### When You're Stuck

- Use \`code_search\` to find similar patterns in the codebase
- Use \`read_files\` to inspect the actual implementation of a service or component
- Reference the key file paths in section 4 above
- Ask me for clarification on architecture or constraints

Good luck! 🚀
`
}

function generateChatGPTPrompt(
  rootBootstrap: string,
  docs: ReturnType<typeof readCoreDocs>
): string {
  return `${rootBootstrap}

---

## ChatGPT-Specific Instructions

You have **MCP tools** available via the Code Interpreter or Tools feature. Use them like Claude:

1. **Start with \`project_map\`** to get a high-level repo view
2. **Use \`code_search\`** to locate files
3. **Use \`read_files\`** to read actual source code
4. **Never invent paths or assume module structure** – always verify
- **Context & Docs/Tests:** Use **context7** for semantic context, \`mcp-db-schema\` + \`mcp-db-inspect\` (mapped to context7) for schema/data, \`mcp-docs-knowledge\` + **markitdown** for docs (mapped to context7/markitdown), **playwright** for browser/E2E, \`mcp-test-runner\` (mapped to ecohub-qa) for validation, \`mcp-ux-assets\` (mapped to context7) for UI references. MCP health snapshot: \`mcp-outputs/${MCP_HEALTH_FILENAME}\`.

### Your Responsibilities

- Before editing marketplace code, read \`src/db/schema/marketplace-v2.ts\`
- Verify that all data fetches go through \`src/services/**\`
- Check admin logic uses \`requireAdminRole()\` from \`lib/auth/roles.ts\`
- After changes, ask me to run: \`pnpm lint && pnpm tsc --noEmit && pnpm build\`
- If unsure about a file path, search for it in the codebase first

### GPT-5.1 Thinking Mode

If using thinking mode, consider:
- Is this a V2 marketplace change or V1 legacy?
- Does the code violate the service-layer pattern?
- Are all security checks (admin role, RLS) in place?
- Will this pass lint and TypeScript checks?

Spend extra time validating before proposing changes. 🧠

Good luck! 🚀
`
}

function generateGeminiPrompt(
  rootBootstrap: string,
  docs: ReturnType<typeof readCoreDocs>
): string {
  return `${rootBootstrap}

---

## Gemini 3.0 Pro – NO MCP Tools Available

⚠️ **You do NOT have MCP tools in this conversation.** Instead:

1. **Ask me to provide updated logs and docs:**
   - Ask for \`mcp-outputs/project_map.log\` to see repo structure
   - Ask for \`mcp-outputs/build_health.log\` to check build status
   - Ask for \`mcp-outputs/${MCP_HEALTH_FILENAME}\` to see which MCP servers are available
   - Ask for relevant \`docs/*.md\` files if they're not included above

2. **Base all reasoning ONLY on provided logs and documentation:**
   - Don't assume file paths – verify them in the logs or docs
   - Don't invent imports – check \`src/services/**\` structure in docs
   - If a path is unclear, ask me before proposing changes

3. **After you propose changes:**
   - Ask me to: \`pnpm lint && pnpm tsc --noEmit && pnpm build\`
   - Paste the output so I can validate your suggestions

### Your Responsibilities

- Stick strictly to the documented architecture: **Marketplace V2 only**, **service layer for all data**
- Verify admin changes use \`requireAdminRole()\` (mentioned in architecture docs)
- Suggest conservative changes when unsure – ask for clarification rather than guessing
- Request fresh logs if status is unclear

### If You Get Stuck

- Ask me to run \`pnpm dev:orchestrator\` again to refresh all logs
- Ask for specific file excerpts (e.g., "show me src/services/listings.ts")
- Request the latest build output before proposing fixes

Good luck! 🚀
`
}

function generateGrokPrompt(rootBootstrap: string, docs: ReturnType<typeof readCoreDocs>): string {
  return `${rootBootstrap}

---

## Grok – NO MCP Tools Available

⚠️ **You do NOT have MCP tools.** Rely on the bootstrap and logs above.

1. **If you need to see the repo structure:**
   - Ask: "Please provide mcp-outputs/project_map.log"
   - Use that log to understand file paths
   - Ask for \`mcp-outputs/${MCP_HEALTH_FILENAME}\` to know which MCP servers are up

2. **If you need build/lint status:**
   - Ask: "Please provide mcp-outputs/build_health.log"
   - Use that to know if tests/lint currently pass

3. **If you're unsure about code:**
   - Ask me to: \`grep -r "pattern" src/\` to find examples
   - Ask for specific file excerpts
   - Request clarification on architecture before coding

### Your Responsibilities

- **Marketplace V2 ONLY** – no V1 \`tregu_listime\` for new features
- **Service layer for all data** – no direct Supabase in components
- **Admin checks** – use \`requireAdminRole()\` for sensitive operations
- **Validation** – use Zod schemas from \`src/validation/**\`

### Before You Propose Code

- Ask for relevant \`docs/*.md\` or \`mcp-outputs/*.log\`
- Verify the architecture matches what I've described above
- Request clarification if anything is unclear

### After You Propose Code

- Ask me to: \`pnpm lint && pnpm tsc --noEmit && pnpm build\`
- Wait for the output before considering changes final

Good luck! 🚀
`
}

function generateCodexPrompt(rootBootstrap: string, docs: ReturnType<typeof readCoreDocs>): string {
  return `${rootBootstrap}

---

## Codex CLI / Code-Focused Tools – NO MCP Tools

⚠️ **You operate without real-time MCP tools.** Work from provided context.

### How to Use This Prompt in Codex CLI

1. **Save this prompt to a file:**
   \`\`\`bash
   cp prompts/bootstrap.codex-cli.md my-prompt.md
   \`\`\`

2. **When running Codex:**
   \`\`\`bash
   codex --prompt my-prompt.md --ask "your task here"
   \`\`\`

3. **If you need repo context:**
   \`\`\`bash
   cat mcp-outputs/project_map.log >> my-prompt.md
   cat docs/architecture-plan.md >> my-prompt.md
   cat mcp-outputs/${MCP_HEALTH_FILENAME} >> my-prompt.md
   \`\`\`

### Your Responsibilities

- **Marketplace V2 only** – reject any V1 \`tregu_listime\` references
- **Service layer** – all data access through \`src/services/**\`
- **Type safety** – no \`any\` types; use Drizzle types
- **Validation** – leverage \`src/validation/**\` Zod schemas

### Before Generating Code

1. Ensure the prompt includes:
   - Architecture principles (section 1 above)
   - Key file reference (section 4 above)
   - The repo structure from \`mcp-outputs/project_map.log\`

2. Ask me for missing context:
   - "Need mcp-outputs/project_map.log to see exact paths"
   - "Need docs/supabase-connection.md for DB setup"
   - "Need src/services/listings.ts to see the listing service interface"

### After Code Generation

1. Request validation:
   \`\`\`bash
   pnpm lint && pnpm tsc --noEmit && pnpm build
   \`\`\`
2. Paste the output for review
3. Make corrections based on errors

Good luck! 🚀
`
}

async function generatePromptBundles(docs: ReturnType<typeof readCoreDocs>, qa: QASnapshot) {
  log("Generating multi-model prompt bundles...")

  const rootBootstrap = generateRootBootstrap(docs, qa)

  const prompts = {
    "bootstrap.sonnet.md": generateSonnetPrompt(rootBootstrap, docs),
    "bootstrap.claude.md": generateClaudePrompt(rootBootstrap, docs),
    "bootstrap.chatgpt.md": generateChatGPTPrompt(rootBootstrap, docs),
    "bootstrap.gemini.md": generateGeminiPrompt(rootBootstrap, docs),
    "bootstrap.grok.md": generateGrokPrompt(rootBootstrap, docs),
    "bootstrap.codex-cli.md": generateCodexPrompt(rootBootstrap, docs),
  }

  for (const [filename, content] of Object.entries(prompts)) {
    const filepath = path.join(PROMPTS_DIR, filename)
    fs.writeFileSync(filepath, content, "utf-8")
    logSuccess(`Generated ${filename}`)
  }
}

// ============================================================================
// MAIN ORCHESTRATOR
// ============================================================================

async function main() {
  console.clear()
  log("🚀 EcoHub Dev Orchestrator Starting")
  log("========================================\n")

  try {
    // Step 1: Check Supabase
    const supabaseStatus = await checkSupabaseConnectivity()
    writeLog(
      "db_check.log",
      JSON.stringify(
        {
          status: "Supabase Connectivity Check",
          ...supabaseStatus,
        },
        null,
        2
      )
    )

    // Step 2: Check MCP Servers
    const mcpHealth = await checkMcpHealth()
    const mcpLogPayload = {
      status: "MCP Health Snapshot",
      ...mcpHealth,
    }
    const mcpHealthJson = JSON.stringify(mcpLogPayload, null, 2)
    writeLog(MCP_HEALTH_FILENAME, mcpHealthJson, LOGS_DIR)
    writeLog(MCP_HEALTH_FILENAME, mcpHealthJson, OUTPUTS_DIR)
    writeLog("mcp_status.log", mcpHealthJson, OUTPUTS_DIR)

    // Step 3: Run Build Health
    const buildHealth = await runBuildHealthChecks()
    writeLog(
      "build_health.log",
      JSON.stringify(
        {
          status: "Build Health Snapshot",
          ...buildHealth,
        },
        null,
        2
      )
    )

    // Step 4: Read Core Docs
    const docs = readCoreDocs()

    // Step 5: Generate Prompts
    const qa: QASnapshot = {
      supabaseStatus,
      buildHealth,
      mcpHealth,
    }
    await generatePromptBundles(docs, qa)

    // Final summary
    console.log("\n" + "=".repeat(60))
    logSuccess("All orchestration steps completed!")
    console.log("=".repeat(60) + "\n")

    logInfo("✅ Supabase Status:")
    console.log(`   ${supabaseStatus.reachable ? "✅ Reachable" : "❌ Unreachable"}`)
    console.log(`   eco_listings: ${supabaseStatus.ecoListingsCount}`)
    console.log(`   eco_organizations: ${supabaseStatus.ecoOrganizationsCount}`)

    logInfo("✅ Build Health:")
    console.log(`   Lint: ${buildHealth.lint.pass ? "✅ PASS" : "❌ FAIL"}`)
    console.log(`   TypeScript: ${buildHealth.tsc.pass ? "✅ PASS" : "❌ FAIL"}`)
    console.log(`   Build: ${buildHealth.build.pass ? "✅ PASS" : "❌ FAIL"}`)

    logInfo("✅ MCP Health:")
    mcpHealth.servers.forEach((s) => {
      const label = s.logicalName || s.name
      const underlying = s.underlyingName ? ` -> ${s.underlyingName}` : ""
      console.log(`   ${label}${underlying}: ${s.ok ? "OK" : "DOWN"} (${s.status})`)
    })

    console.log("\n" + "=".repeat(60))
    logInfo("📂 Output Locations:")
    console.log(`   Outputs: ${OUTPUTS_DIR}/`)
    console.log(`   Prompts: ${PROMPTS_DIR}/`)
    console.log(`   MCP health: ${path.join(LOGS_DIR, MCP_HEALTH_FILENAME)}`)
    console.log(`   Log files: ${LOGS_DIR}/`)

    console.log("\n" + "=".repeat(60))
    logInfo("🎯 Next Steps:")
    console.log("   1. Open prompts/bootstrap.claude.md and paste into Claude")
    console.log("   2. For Claude Sonnet: use prompts/bootstrap.sonnet.md")
    console.log("   3. For ChatGPT: use prompts/bootstrap.chatgpt.md")
    console.log("   4. For Gemini: use prompts/bootstrap.gemini.md")
    console.log("   5. For Grok: use prompts/bootstrap.grok.md")
    console.log("   6. For Codex CLI: use prompts/bootstrap.codex-cli.md")
    console.log("\n   When in doubt, re-run: pnpm dev:orchestrator\n")
  } catch (err) {
    logError(`Orchestrator failed: ${err instanceof Error ? err.message : String(err)}`)
    process.exit(1)
  }
}

// Run the orchestrator
main().catch((err) => {
  logError(`Fatal error: ${err}`)
  process.exit(1)
})
