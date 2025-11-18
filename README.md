# EcoHub Kosova

EcoHub Kosova is a Next.js App Router project that powers a circular-economy portal for listings, organizations, knowledge-base articles, and administrative workflows. The app features a dynamic header system, robust database error handling, and comprehensive internationalization support.

## Tech Stack

- **Framework:** Next.js 16+ (App Router, TypeScript, Server Components)
- **UI:** Tailwind CSS, shadcn/ui, lucide-react icons
- **Data/Auth:** Supabase client + auth helpers, Drizzle ORM
- **Internationalization:** Next-intl for locale-aware routing
- **Tooling:** PNPM, ESLint (`next/core-web-vitals`), TypeScript strict mode, MCP Context Server
- **Testing:** Vitest, React Testing Library, Playwright (E2E)

## Key Features

### 🚀 Dynamic Header System
- **Zero DB Errors**: Header detects auth state without triggering database calls on public pages
- **Responsive Design**: Clean, modern navigation that adapts to user authentication status
- **Performance Optimized**: Lazy profile loading prevents unnecessary API calls

### 🛡️ Robust Database Error Handling
- **Smart Error Classification**: `dbUnavailable` flag distinguishes connection vs logic errors
- **Selective Error Display**: Database banners only show for actual connection failures
- **Graceful Degradation**: App remains functional during temporary database outages

### 🌐 Internationalization
- **Locale-Aware Routing**: Proper Next.js Link components with locale preservation
- **Multi-Language Support**: Seamless navigation between login/register pages
- **Clean Auth Forms**: Removed heavy shadows for modern, accessible design

### 🔧 Developer Experience
- **MCP Context Server**: AI-powered code analysis and semantic search
- **QA Automation**: Comprehensive testing scripts (`qa-full.sh`, `qa-quick.sh`)
- **Component Architecture**: Well-organized layout wrappers and service layers

## Getting Started

1. Install PNPM if you don't already have it: `corepack enable`
2. Install dependencies:

```bash
pnpm install
```

3. Copy `.env.example` to `.env.local` (or create it) and fill in the Supabase keys and any other secrets the app expects (`NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_DB_URL` for Drizzle). If you load remote images (e.g., Supabase Storage, partner CDNs), list their hostnames in `NEXT_PUBLIC_ALLOWED_IMAGE_HOSTS` (comma separated) so Next.js only serves optimized assets from approved origins.
4. Start the dev server:

```bash
pnpm dev
```

The app runs on [http://localhost:3000](http://localhost:3000).

## Available Scripts

| Command        | Description                                  |
| -------------- | -------------------------------------------- |
| `pnpm dev`     | Start the Next.js development server         |
| `pnpm build`   | Create a production build (lint+type checks) |
| `pnpm start`   | Start the production server (`pnpm build` first) |
| `pnpm lint`    | Run ESLint with the Next.js config           |
| `pnpm format`  | Format code with Prettier                    |
| `pnpm format:check` | Check Prettier formatting                    |
| `pnpm test`    | Run Vitest unit/component tests              |
| `pnpm test:watch` | Watch mode for Vitest during development    |
| `pnpm test:e2e` | Run Playwright end-to-end tests              |
| `pnpm qa:quick` | Quick QA check (build, auth, navigation, etc.) |
| `pnpm qa:full` | Full QA suite with MCP server validation     |
| `pnpm check:src-structure` | Validate source code organization            |
| `pnpm drizzle:generate` | Generate Drizzle types from schema           |
| `pnpm db:sync` | Sync database schema and regenerate types    |

> **Note:** `pnpm build` currently requires network access to download Google Fonts (Inter) the first time it runs.

## Project Structure Highlights

- `src/app/` – App Router routes organized by route groups: `(site)`, `(protected)`, `(auth)`
- `src/components/layout/` – Layout components including dynamic header and sidebar layouts
- `src/components/` – Shared UI components (shadcn/ui exports, listings, profiles)
- `src/lib/` – Supabase client, auth provider, profile services, and utilities
- `src/services/` – Business logic layer with admin, public, and profile services
- `src/hooks/` – Custom React hooks for data fetching and state management
- `tools/` – MCP servers and QA automation tools
- `supabase/migrations/` – Database schema migrations
- `.todo/` – Development planning and task tracking

### Source Layout Guardrail

All feature code lives under `src/**`. The shadcn UI generator (`components.json`) is configured with `@/components` / `@/lib` aliases so new components automatically land in `src/…`. To keep the tree clean, `pnpm lint` now runs `pnpm check:src-structure`, which fails the build if any `.ts/.tsx/.js/.jsx` file shows up outside the approved directories. Run the check manually at any time with:

```bash
pnpm check:src-structure
```

### QA & Testing Tools

The project includes comprehensive QA automation:

```bash
# Quick QA check (build, auth, navigation, runtime, Supabase, env)
pnpm qa:quick

# Full QA suite (includes database queries, MCP server health)
pnpm qa:full
```

These scripts use the EcoHub QA MCP Server for automated testing and validation.

## Database & Supabase CLI

Database schema changes now live under `supabase/migrations/**` and seed data is in `supabase/seed.sql`. Use the Supabase CLI (via `pnpm dlx supabase` or a global install) for all DB work:

1. `pnpm dlx supabase login` – paste a Supabase access token from your dashboard.
2. `pnpm dlx supabase link --project-ref xjyseqtfuxcuviiankhy --password <database_password>` – associates the CLI with this project.
3. `pnpm dlx supabase db diff -f <migration_name>` – generates a new migration after you change the schema.
4. `pnpm dlx supabase db push` (remote) or `pnpm dlx supabase db reset` (local) – apply migrations & seed data.

See `docs/database-migrations.md` for the full workflow, including environment variables to set and troubleshooting tips. The legacy SQL files under `scripts/` remain for historical context but should no longer be edited.

> **Drizzle ORM:** Admin services now run through Drizzle + the Supabase Postgres connection string. Set `SUPABASE_DB_URL` (available from your Supabase dashboard → Project Settings → Database) so server actions can establish the connection securely.

When you change the schema, generate refreshed Drizzle types with:

```bash
pnpm drizzle:generate
```

> **`pnpm db:sync`:** After adjusting the schema locally, run `pnpm db:sync` to (1) diff the Supabase database via CLI, (2) push the migrations, and (3) regenerate Drizzle types. This command requires `SUPABASE_DB_URL` (see `.env.example`).

## Public API (React Native readiness)

To give future React Native or partner clients a stable integration surface, the core read-model is now available under `/api/v1`:

| Endpoint | Description |
| --- | --- |
| `GET /api/v1/listings?category=&type=&search=` | Returns approved marketplace listings. Optional filters for category, listing type (`shes` / `blej`), or title search. |
| `GET /api/v1/organizations?lloji=&search=` | Returns approved organizations. Filter by organization type or search by name. |
| `GET /api/v1/articles?category=&search=` | Returns published knowledge-base articles with optional category or title search filters. |

All responses are JSON in the shape `{ data: [...] }` or `{ error: string }`, and they reuse the same Drizzle services that power the web UI so mobile clients and the web stay in sync automatically.

## Contributing Workflow

1. Create a feature branch from `main`.
2. Make your changes with `pnpm dev`.
3. Run `pnpm lint`, `pnpm test`, and `pnpm build`.
4. Commit using conventional-ish messages (e.g., `feat: ...`, `fix: ...`, `chore: ...`).
5. Open a PR against `main`.

## Testing

- `pnpm test` – runs the Vitest + React Testing Library suite (unit/component).
- `pnpm test:watch` – watch mode for Vitest during local development.
- `pnpm test:e2e` – re-enables the Playwright end-to-end tests; the config auto-starts `pnpm dev` on port 3000 if needed.

Playwright artifacts (HTML report, traces) are written to the default `playwright-report/` folder, and Vitest coverage is available under `coverage/` when needed.

## Formatting

Prettier enforces a consistent style across contributors:

- `pnpm format` – formats the entire repository (honoring `.prettierignore`).
- `pnpm format:check` – CI-friendly check.

Consider wiring `pnpm format` into a pre-commit hook (e.g., via Husky) if you prefer automatic formatting before pushes.

## Roadmap / Next Steps

See `ARCHITECTURE_VISION_V6.md`, `ARCHITECTURE_ROADMAP_V3.md`, and other documentation files for the current plan. Recent major accomplishments include:

### ✅ Recently Completed
- **Dynamic Header System**: Zero DB errors on public pages with responsive auth-aware navigation
- **Robust DB Error Handling**: Smart error classification and selective banner display
- **Auth Flow Optimization**: Clean public pages with proper locale-aware navigation
- **Component Architecture**: Improved layout organization and service layer separation
- **QA Automation**: Comprehensive testing scripts with MCP server integration

### 🔄 Upcoming Initiatives
- Enhanced E2E testing coverage with Playwright
- Performance optimizations and bundle analysis
- Advanced admin dashboard features
- Mobile responsiveness improvements
- API rate limiting and security enhancements

### 📚 Documentation
- `AUTH_PROFILE_HARDENING_COMPLETE.md` – Authentication system hardening details
- `MCP_NATURAL_LANGUAGE_GUIDE.md` – MCP context server usage guide
- `MCP_SERVERS_INTEGRATION_GUIDE.md` – MCP server integration patterns
- `ARCHITECTURE_*` files – Comprehensive system architecture documentation

## License

This repository currently doesn’t declare a license. If you plan to open source it, add one under the root (e.g., `LICENSE`).
