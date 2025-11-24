# EcoHub Dev Orchestrator – Quick Reference 🚀

## One-Line Start

```bash
pnpm dev:orchestrator && cat prompts/bootstrap.claude.md
```

## VS Code One-Click

- Open the EcoHub folder and run the `eco:dev-all` task when prompted (runs MCP + Next dev in parallel).
- Individual tasks: `eco:mcp-servers`, `eco:next-dev`, `eco:dev-orchestrator`, `eco:mcp-health-check`.
- Debug config `EcoHub: Next.js dev` uses `eco:dev-all` as its `preLaunchTask` to ensure everything is up.

## The 5-Minute Setup

1. **Run orchestrator** (takes ~10 seconds):

   ```bash
   pnpm dev:orchestrator
   ```

2. **Pick your AI model** and copy the prompt:

   ```bash
   cat prompts/bootstrap.claude.md      # Claude Sonnet/Haiku
   cat prompts/bootstrap.chatgpt.md     # ChatGPT GPT-5.1
   cat prompts/bootstrap.gemini.md      # Gemini 3.0 Pro
   cat prompts/bootstrap.grok.md        # Grok
   cat prompts/bootstrap.codex-cli.md   # Codex CLI
   ```

3. **Paste entire prompt** into your AI tool (as first message)

4. **Give your task**, e.g.:

   > "Fix the marketplace location filter to use Kosovo cities"

5. **Let AI inspect code** (MCP tools) or **provide logs** (Gemini/Grok/Codex)

6. **Validate** locally:
   ```bash
   pnpm lint && pnpm tsc --noEmit && pnpm build
   ```

---

## Output Locations

| Directory      | Purpose                                                |
| -------------- | ------------------------------------------------------ |
| `mcp-outputs/` | Live status logs (Supabase, build health, MCP servers) |
| `prompts/`     | AI model-specific bootstraps                           |

---

## MCP Health Check (single source of truth)

- Run `./scripts/check-mcp-health.sh` (or `node tools/run-mcp-task.js build_health '{}'`) before any model session.
- Health snapshots: `mcp-outputs/mcp-health.json` and `mcp-outputs/build_health.log`.
- VS Code task: `eco:mcp-health-check`.

---

## What You Get

✅ **Fresh context** – current architecture + code patterns  
✅ **Live health** – Supabase connectivity + build status  
✅ **MCP tools** – Claude/ChatGPT can search + read files  
✅ **Model optimization** – tailored for each platform  
✅ **V2-only guarantee** – no legacy code references

---

## The Rules (Enforce These)

1. ✅ **Marketplace V2 only** – `eco_listings` not `tregu_listime`
2. ✅ **Service layer** – all data through `src/services/**`
3. ✅ **Admin checks** – use `requireAdminRole()` for sensitive ops
4. ✅ **Supabase pooler** – port 6543, NOT 5432
5. ✅ **Drizzle ORM** – no direct Supabase in routes/components

---

## Common Tasks

### Fix a bug

```bash
pnpm dev:orchestrator
cat prompts/bootstrap.claude.md  # paste into Claude
# Tell Claude: "Fix the [bug description]"
pnpm lint && pnpm build
```

### Add a feature

```bash
pnpm dev:orchestrator
cat prompts/bootstrap.chatgpt.md  # paste into ChatGPT
# Tell ChatGPT: "Add [feature description] to marketplace"
pnpm lint && pnpm build
```

### Refactor code

```bash
pnpm dev:orchestrator
cat prompts/bootstrap.gemini.md   # paste into Gemini
# Tell Gemini: "Refactor [component/service] to [goal]"
pnpm lint && pnpm build
```

---

## Troubleshooting

**Orchestrator fails?**

```bash
# Check Supabase connection
echo $SUPABASE_DB_URL

# Verify it has pooler host
# Should contain: aws-1-eu-west-1.pooler.supabase.com:6543
```

**Build check shows FAIL?**

```bash
# Fix errors first
pnpm lint
pnpm tsc --noEmit

# Then re-run orchestrator
pnpm dev:orchestrator
```

**Missing logs?**

```bash
# Just run orchestrator again
pnpm dev:orchestrator

# Logs are always regenerated
```

---

## File Paths to Know

| Path                               | Purpose                   |
| ---------------------------------- | ------------------------- |
| `src/db/schema/marketplace-v2.ts`  | V2 marketplace tables     |
| `src/services/listings.ts`         | Marketplace query service |
| `src/services/profile.ts`          | User profile service      |
| `app/[locale]/(site)/marketplace/` | Marketplace UI            |
| `lib/auth/roles.ts`                | Admin role checks         |
| `src/validation/auth.ts`           | Auth Zod validators       |

---

## Document Reference

- **Full guide:** `docs/dev-orchestrator.md`
- **Implementation details:** `ORCHESTRATOR_IMPLEMENTATION_SUMMARY.md`
- **Session summary:** `SESSION_SUMMARY_ORCHESTRATOR.md`
- **Architecture:** `docs/architecture-plan.md`
- **Supabase help:** `docs/supabase-connection.md`

---

## Pro Tips

💡 **MCP users (Claude/ChatGPT):** Always let the AI search + read files. Don't copy-paste unless it asks.

💡 **Log-based users (Gemini/Grok/Codex):** Provide `mcp-outputs/*.log` when asked. They help AI understand your setup.

💡 **Before each session:** Run `pnpm dev:orchestrator` to refresh context.

💡 **After big changes:** Re-run orchestrator so next session knows about them.

---

## Status Snapshot Example

```
✅ Supabase reachable (eco_listings: 9, eco_organizations: 12)
- Lint: ✅ PASS
- TypeScript: ✅ PASS
- Build: ❌ FAIL
```

This tells AI:

- ✅ DB is live (can query listings)
- ✅ Code currently lints clean
- ✅ TypeScript compiles
- ❌ Build has issues (fix first)

---

## One Command, Five Prompts, Infinite Possibilities 🚀

**Get started:**

```bash
pnpm dev:orchestrator
```

**Ready to code!** 🎯
