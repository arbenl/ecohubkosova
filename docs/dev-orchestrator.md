# EcoHub Dev Orchestrator – Complete Guide

## Overview

The **Dev Orchestrator** is an automated system that:

1. ✅ **Verifies Supabase connectivity** and captures DB health metrics
2. ✅ **Runs build health checks** (lint, TypeScript, build)
3. ✅ **Checks MCP server status** (mcp-context-server, ecohub-qa)
4. ✅ **Generates multi-model prompt bundles** for Claude, ChatGPT, Gemini, Grok, and Codex CLI
5. ✅ **Logs all outputs** to `mcp-outputs/` for reference

## Quick Start

### Run the Orchestrator

```bash
pnpm dev:orchestrator
```

This command:

- Takes ~10-15 seconds (build checks are the slowest part)
- Writes logs to `mcp-outputs/` (JSON format)
- Generates 5 model-specific prompts in `prompts/`
- Prints a summary to console

### Use the Generated Prompts

1. **For Claude Sonnet/Haiku:**

   ```bash
   cat prompts/bootstrap.claude.md
   # Copy entire contents and paste into Claude conversation
   ```

2. **For ChatGPT GPT-5.1:**

   ```bash
   cat prompts/bootstrap.chatgpt.md
   # Paste into ChatGPT before asking your task
   ```

3. **For Gemini 3.0 Pro:**

   ```bash
   cat prompts/bootstrap.gemini.md
   ```

4. **For Grok:**

   ```bash
   cat prompts/bootstrap.grok.md
   ```

5. **For Codex CLI:**
   ```bash
   cat prompts/bootstrap.codex-cli.md
   # Reference when using: codex --prompt ...
   ```

## Output Structure

### Logs Directory: `mcp-outputs/`

After running `pnpm dev:orchestrator`, you'll see:

```
mcp-outputs/
├── db_check.log           # Supabase connectivity + eco_listings count
├── mcp_status.log         # MCP server process status
└── build_health.log       # Lint, TypeScript, build results (JSON)
```

**Example `db_check.log`:**

```json
{
  "status": "Supabase Connectivity Check",
  "reachable": true,
  "ecoListingsCount": 142,
  "ecoOrganizationsCount": 18,
  "timestamp": "2025-11-23T14:35:22Z"
}
```

### Prompts Directory: `prompts/`

5 model-specific bootstraps:

- `bootstrap.claude.md` – Optimized for Claude (includes MCP tool instructions)
- `bootstrap.chatgpt.md` – Optimized for ChatGPT (includes GPT-5.1 thinking tips)
- `bootstrap.gemini.md` – Optimized for Gemini (no MCP tools, relies on logs)
- `bootstrap.grok.md` – Optimized for Grok (no MCP tools)
- `bootstrap.codex-cli.md` – Optimized for Codex CLI (code-focused, instructions for file pasting)

## Architecture of the Orchestrator

### Main Components

**File: `scripts/dev-orchestrator.ts`** (TypeScript, ~400 lines)

```
┌─────────────────────────────────────────────────────────────┐
│  pnpm dev:orchestrator (tsx scripts/dev-orchestrator.ts)    │
└─────────────────────────────────────────────────────────────┘
           │
           ├─ Step 1: Check Supabase Connectivity
           │          └─ Run: SELECT COUNT(*) FROM eco_listings
           │          └─ Write: mcp-outputs/db_check.log
           │
           ├─ Step 2: Check MCP Servers
           │          └─ Check: ps aux for mcp-context-server, ecohub-qa
           │          └─ Write: mcp-outputs/mcp_status.log
           │
           ├─ Step 3: Run Build Health Checks
           │          ├─ pnpm lint
           │          ├─ pnpm tsc --noEmit
           │          └─ pnpm build (sample last 20 lines)
           │          └─ Write: mcp-outputs/build_health.log
           │
           ├─ Step 4: Read Core Documentation
           │          ├─ docs/dev-bootstrap-prompts.md
           │          ├─ docs/supabase-connection.md
           │          ├─ docs/architecture-plan.md
           │          ├─ docs/data-layer-review.md
           │          └─ docs/marketplace-v2-tutorial-sq.md
           │
           ├─ Step 5: Generate Root Bootstrap Template
           │          └─ Merges logs + docs into unified context
           │
           └─ Step 6: Generate 5 Model-Specific Prompts
                      ├─ bootstrap.claude.md
                      ├─ bootstrap.chatgpt.md
                      ├─ bootstrap.gemini.md
                      ├─ bootstrap.grok.md
                      └─ bootstrap.codex-cli.md
```

## Troubleshooting

### "Supabase not reachable"

**Cause:** `SUPABASE_DB_URL` environment variable not set or points to wrong host.

**Fix:**

```bash
# Verify env var
echo $SUPABASE_DB_URL

# Should output something like:
# postgresql://postgres:[password]@aws-1-eu-west-1.pooler.supabase.com:6543/postgres

# If missing, source your .env.local
source .env.local
pnpm dev:orchestrator
```

### "MCP servers not detected"

**Cause:** `mcp-context-server` or `ecohub-qa-server` not running.

**Fix:**

```bash
# Start them
pnpm dev

# In another terminal, run the orchestrator
pnpm dev:orchestrator
```

### "Build/Lint/TypeScript checks failed"

**Cause:** Code has errors.

**Fix:**

```bash
# Check local errors
pnpm lint
pnpm tsc --noEmit
pnpm build

# Fix errors
# Then re-run orchestrator
pnpm dev:orchestrator
```

### "Prompts not generated"

**Cause:** Missing documentation files in `docs/`.

**Fix:**

```bash
# Verify required docs exist
ls docs/dev-bootstrap-prompts.md
ls docs/supabase-connection.md
ls docs/architecture-plan.md

# If missing, the orchestrator will still generate prompts but with incomplete info
# Re-run after files are added
pnpm dev:orchestrator
```

## When to Re-Run the Orchestrator

**Run BEFORE each AI model session:**

```bash
pnpm dev:orchestrator
```

You should re-run if:

- ✅ You made significant code changes
- ✅ You switched between branches
- ✅ Build health changed
- ✅ DB schema was migrated
- ✅ Starting a fresh AI session
- ✅ You forgot the current context

**Why?** The orchestrator guarantees your AI model has:

- Current architecture snapshot
- Real build/lint status
- Live Supabase connection metrics
- Fresh MCP server availability

## Integration with AI Workflows

### Claude + MCP Tools Workflow

1. Run orchestrator:

   ```bash
   pnpm dev:orchestrator
   ```

2. Paste `prompts/bootstrap.claude.md` into Claude

3. Give Claude a task, e.g.:

   > "Fix the marketplace location filter to use Kosovo cities"

4. Claude will:
   - Use `project_map` to see repo structure
   - Use `code_search` to find relevant files
   - Use `read_files` to inspect actual code
   - Propose changes based on real code
   - Ask you to run `pnpm lint && pnpm build` to validate

### ChatGPT + Tools Workflow

1. Run orchestrator:

   ```bash
   pnpm dev:orchestrator
   ```

2. Paste `prompts/bootstrap.chatgpt.md` into ChatGPT

3. Tell ChatGPT your task

4. ChatGPT can use available tools (Code Interpreter, Web Browsing) for context

### Gemini/Grok/Codex CLI Workflow (No MCP)

1. Run orchestrator:

   ```bash
   pnpm dev:orchestrator
   ```

2. Paste `prompts/bootstrap.gemini.md` (or grok/codex) into your model

3. If model asks for specific files:
   - Request via `code_search`: "Search for files related to marketplace listings"
   - Provide via `read_files`: "Show me src/services/listings.ts"
   - Use logs from `mcp-outputs/` to answer status questions

## Advanced: Custom Orchestrator Runs

### Quick DB Status Check Only

```bash
# From Node.js REPL or custom script
SUPABASE_DB_URL=$(echo $SUPABASE_DB_URL) pnpm dlx ts-node -e "
  import { execSync } from 'child_process';
  const out = execSync('psql \"\$SUPABASE_DB_URL\" -c \"SELECT COUNT(*) FROM eco_listings;\"', { encoding: 'utf-8' });
  console.log(out);
"
```

### Run Just Build Checks

```bash
# Lint + TypeScript + Build
pnpm lint && pnpm tsc --noEmit && pnpm build
```

### Generate Prompts Manually

If you only want prompts without orchestrator overhead:

```bash
# Read a single prompt template
cat prompts/bootstrap.claude.md
```

Or edit `tools/dev-orchestrator.ts` to skip certain steps by commenting out Step 1-3 and just running Step 4-6.

## Expected Output Example

```
[DEV-ORCHESTRATOR] 🚀 EcoHub Dev Orchestrator Starting
[DEV-ORCHESTRATOR] ========================================

[DEV-ORCHESTRATOR] Checking Supabase connectivity...
✅ Supabase reachable (eco_listings: 142, eco_organizations: 18)
ℹ️  Wrote db_check.log

[DEV-ORCHESTRATOR] Checking MCP servers...
✅ MCP context server running
✅ EcoHub QA server running
ℹ️  Wrote mcp_status.log

[DEV-ORCHESTRATOR] Running build health checks...
✓ Compiled successfully in 3.7s
✅ Lint check passed
✅ TypeScript check passed
✅ Build check passed
ℹ️  Wrote build_health.log

[DEV-ORCHESTRATOR] Reading core documentation...
[DEV-ORCHESTRATOR] Generating multi-model prompt bundles...
✅ Generated bootstrap.claude.md
✅ Generated bootstrap.chatgpt.md
✅ Generated bootstrap.gemini.md
✅ Generated bootstrap.grok.md
✅ Generated bootstrap.codex-cli.md

============================================================
✅ All orchestration steps completed!
============================================================

✅ Supabase Status:
   ✅ Reachable
   eco_listings: 142
   eco_organizations: 18

✅ Build Health:
   Lint: ✅ PASS
   TypeScript: ✅ PASS
   Build: ✅ PASS

============================================================
📂 Output Locations:
   Logs: /Users/.../ecohubkosova/mcp-outputs/
   Prompts: /Users/.../ecohubkosova/prompts/

============================================================
🎯 Next Steps:
   1. Open prompts/bootstrap.claude.md and paste into Claude
   2. For ChatGPT: use prompts/bootstrap.chatgpt.md
   3. For Gemini: use prompts/bootstrap.gemini.md
   4. For Grok: use prompts/bootstrap.grok.md
   5. For Codex CLI: use prompts/bootstrap.codex-cli.md

   When in doubt, re-run: pnpm dev:orchestrator
```

## Summary

| Aspect          | Details                                         |
| --------------- | ----------------------------------------------- |
| **Command**     | `pnpm dev:orchestrator`                         |
| **Duration**    | ~10-15 seconds                                  |
| **Output**      | Logs in `mcp-outputs/`, prompts in `prompts/`   |
| **Frequency**   | Before each AI session or after code changes    |
| **Key Benefit** | Guarantees AI model has fresh, accurate context |

---

**Questions?** See `docs/architecture-plan.md` for system design or ask your AI assistant with the generated prompt!
