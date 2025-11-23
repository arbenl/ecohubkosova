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

// Ensure output directories exist
for (const dir of [OUTPUTS_DIR, PROMPTS_DIR]) {
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

function writeLog(filename: string, content: string) {
  const filepath = path.join(OUTPUTS_DIR, filename)
  fs.writeFileSync(filepath, content, "utf-8")
  logInfo(`Wrote ${filename}`)
}

function readDocIfExists(docName: string): string {
  const docPath = path.join(DOCS_DIR, docName)
  if (fs.existsSync(docPath)) {
    return fs.readFileSync(docPath, "utf-8")
  }
  return ""
}

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

async function checkMCPServers(): Promise<{
  mcp_context_server: boolean
  ecohub_qa_server: boolean
  timestamp: string
}> {
  log("Checking MCP servers...")

  const result = {
    mcp_context_server: false,
    ecohub_qa_server: false,
    timestamp: new Date().toISOString(),
  }

  // Check if MCP processes are running by looking for typical processes
  try {
    const procs = execSync("ps aux | grep -E 'mcp|ecohub-qa'", {
      encoding: "utf-8",
    })
    result.mcp_context_server = procs.includes("mcp-context-server")
    result.ecohub_qa_server = procs.includes("ecohub-qa")
  } catch {
    logInfo("MCP process check incomplete; servers may still be starting")
  }

  if (result.mcp_context_server) {
    logSuccess("MCP context server running")
  } else {
    logInfo("MCP context server not detected; you may need to run: npm run dev")
  }

  if (result.ecohub_qa_server) {
    logSuccess("EcoHub QA server running")
  } else {
    logInfo("EcoHub QA server not detected; you may need to run: npm run dev")
  }

  return result
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
    const output = execSync("pnpm build 2>&1 | tail -20", {
      cwd: PROJECT_ROOT,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    })
    result.build = { pass: output.includes("✓"), output: output.slice(0, 500) }
    if (result.build.pass) {
      logSuccess("Build check passed")
    } else {
      logInfo("Build output captured")
    }
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
}

function generateRootBootstrap(docs: ReturnType<typeof readCoreDocs>, qa: QASnapshot): string {
  const supabaseStatusLine = qa.supabaseStatus.reachable
    ? `✅ Supabase reachable (eco_listings: ${qa.supabaseStatus.ecoListingsCount}, eco_organizations: ${qa.supabaseStatus.ecoOrganizationsCount})`
    : `❌ Supabase not reachable`

  const buildStatusLine = `
- Lint: ${qa.buildHealth.lint.pass ? "✅ PASS" : "❌ FAIL"}
- TypeScript: ${qa.buildHealth.tsc.pass ? "✅ PASS" : "❌ FAIL"}
- Build: ${qa.buildHealth.build.pass ? "✅ PASS" : "❌ FAIL"}`

  return `# EcoHub Kosova – Dev Bootstrap & Context

**Current Status Snapshot** (${new Date().toISOString()}):
${supabaseStatusLine}
${buildStatusLine}

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

## 2. MCP Tools & Development Rules

### If You Have MCP Tools Available (Claude/ChatGPT with Tools)

**Always follow this workflow before proposing code changes:**

1. **Call \`project_map\`** to understand repo layout
2. **Call \`code_search\`** to locate relevant files
3. **Call \`read_files\`** to inspect actual code (never guess paths or invent imports)
4. **Propose changes only based on real file contents**
5. **After significant changes, manually run \`pnpm build && pnpm lint && pnpm tsc --noEmit\`** to validate

### If You Do NOT Have MCP Tools (Gemini/Grok/Codex CLI)

**Base your reasoning ONLY on the pasted logs and real documentation:**

1. Ask me to provide \`mcp-outputs/*.log\` and \`docs/*.md\` if they're missing
2. Trust the directory structure shown in logs; don't assume file paths
3. When editing, be extra careful with imports and file extensions
4. Request a fresh \`pnpm lint && pnpm build\` output after your changes

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

3. **Paste the entire prompt into your model as the first message** before giving it any task.

### During Development

- **Before touching files:** Always use MCP tools (if available) to \`code_search\` and \`read_files\`
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
- Ensure MCP servers are running (they start with \`pnpm dev\`)
- Use the model-specific prompt bundle from \`prompts/\` for your AI model
- Ask your AI to inspect files via MCP tools before making changes
- Report any blockers or unclear architecture to me
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
    const mcpStatus = await checkMCPServers()
    writeLog(
      "mcp_status.log",
      JSON.stringify(
        {
          status: "MCP Server Status Check",
          ...mcpStatus,
        },
        null,
        2
      )
    )

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

    console.log("\n" + "=".repeat(60))
    logInfo("📂 Output Locations:")
    console.log(`   Logs: ${OUTPUTS_DIR}/`)
    console.log(`   Prompts: ${PROMPTS_DIR}/`)

    console.log("\n" + "=".repeat(60))
    logInfo("🎯 Next Steps:")
    console.log("   1. Open prompts/bootstrap.claude.md and paste into Claude")
    console.log("   2. For ChatGPT: use prompts/bootstrap.chatgpt.md")
    console.log("   3. For Gemini: use prompts/bootstrap.gemini.md")
    console.log("   4. For Grok: use prompts/bootstrap.grok.md")
    console.log("   5. For Codex CLI: use prompts/bootstrap.codex-cli.md")
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
