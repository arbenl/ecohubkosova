Context for this workspace (EcoHub Kosova):

- Stack: Next.js 16 App Router, TypeScript, Supabase Postgres, Drizzle ORM, next-intl, Playwright E2E.
- Auth & profile: Already stabilized and considered source of truth. DO NOT redesign auth, profile, or RLS now unless I explicitly ask.
- Marketplace:
  - We have a new V2 schema: eco_listings, eco_categories, eco_organizations, eco_listing_media, eco_listing_interactions (all in src/db/schema/marketplace-v2.ts and enums in src/db/schema/enums.ts).
  - Old table tregu_listime and the old marketplace are considered legacy. DO NOT add new code on top of tregu_listime. If you see it, treat it as V1/legacy.
  - New UI lives under app/[locale]/(site)/marketplace-v2/, with:
    - page.tsx
    - MarketplaceV2Client.tsx
    - ListingCardV2.tsx
    - FiltersV2.tsx
    - (pagination and create-listing UI may still be missing or partial).

- MCP tools:
  - Use mcp-context-server-style behavior conceptually: before proposing edits, “mentally” run project_map / code_search / read_files by:
    - locating real files in this repo,
    - reading their contents,
    - and basing changes ONLY on actual code (no guessing paths).
  - Expanded MCP set available:
    - context7 (semantic code/doc lookup), playwright (browser/E2E automation), markitdown (doc → Markdown)
    - mcp-context-server (project_map/code_search/read_files), ecohub-qa (build_health), plus planned db/test/docs/ux servers
    - Logical mapping: DB tools (mcp-db-schema, mcp-db-inspect) → context7; Tests (mcp-test-runner) → ecohub-qa; Docs/knowledge + UX/assets (mcp-docs-knowledge, mcp-ux-assets) → context7 (+ markitdown for docs)
  - Use ecohub-qa equivalents conceptually: after bigger changes, I will manually run:
    - tools/ecohub-qa: node run-qa-tool.js build_health
    - playwright E2E tests
  - So always keep code QA-friendly: type-safe, no any, no console.log spam.

How you should help me:

1. Always inspect existing files before suggesting changes (for marketplace V2: schema, API route, marketplace-v2 components).
2. When you propose changes, give me complete, ready-to-paste code blocks (not just snippets).
3. Keep everything aligned with Marketplace V2 (eco_listings, eco_categories, etc.), not the old tregu_listime.
4. When touching tests, prefer adding or fixing Playwright tests under e2e/marketplace or e2e/marketplace-v2, and ensure they are stable and fast.

Task I want to work on now:
[👉 Here I will describe the concrete task I want: e.g. “implement pagination in marketplace-v2”, or “add create-listing form for V2”, or “harden e2e tests for marketplace-v2”.]
