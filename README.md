# EcoHub Kosova

EcoHub Kosova is a Next.js App Router project that powers a circular-economy portal for listings, organizations, knowledge-base articles, and administrative workflows. The app is built with PNPM, TypeScript, Tailwind CSS + shadcn/ui, and Supabase for auth/data.

## Tech Stack

- **Framework:** Next.js 14 (App Router, TypeScript, Server Components)
- **UI:** Tailwind CSS, shadcn/ui, lucide-react icons
- **Data/Auth:** Supabase client + auth helpers
- **Tooling:** PNPM, ESLint (`next/core-web-vitals`), TypeScript strict mode

## Getting Started

1. Install PNPM if you don't already have it: `corepack enable`
2. Install dependencies:

```bash
pnpm install
```

3. Copy `.env.example` to `.env.local` (or create it) and fill in the Supabase keys and any other secrets the app expects (`NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_DB_URL` for Drizzle).
4. Start the dev server:

```bash
pnpm dev
```

The app runs on [http://localhost:3000](http://localhost:3000).

## Available Scripts

| Command        | Description                                  |
| -------------- | -------------------------------------------- |
| `pnpm dev`     | Start the Next.js development server         |
| `pnpm lint`    | Run ESLint with the Next.js config           |
| `pnpm test`    | Placeholder hook (replace with real tests)   |
| `pnpm build`   | Create a production build (lint+type checks) |
| `pnpm start`   | Start the production server (`pnpm build` first) |

> **Note:** `pnpm build` currently requires network access to download Google Fonts (Inter) the first time it runs.

## Project Structure Highlights

- `app/` – App Router routes for pages (home, auth, admin, marketplace, etc.).
- `components/` – Shared UI components (header/footer, listings, shadcn/ui exports).
- `lib/` – Supabase client, auth provider, utilities.
- `docs/roadmap.md` – High-level roadmap of upcoming initiatives.
- `docs/next-session-specs.md` – The short-term TODO list for the next coding session.

### Source Layout Guardrail

All feature code lives under `src/**`. The shadcn UI generator (`components.json`) is configured with `@/components` / `@/lib` aliases so new components automatically land in `src/…`. To keep the tree clean, `pnpm lint` now runs `pnpm check:src-structure`, which fails the build if any `.ts/.tsx/.js/.jsx` file shows up outside the approved directories. Run the check manually at any time with:

```bash
pnpm check:src-structure
```

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

## Roadmap / Next Steps

See `docs/roadmap.md` and `docs/next-session-specs.md` for the current plan. Highlights include:

- Moving Supabase CRUD into server actions/route handlers to secure API access.
- Adding automated tests (Vitest/Playwright) and CI workflows.
- Planning the eventual move back to React 19 / Next 15 once upstream libraries support it.

## License

This repository currently doesn’t declare a license. If you plan to open source it, add one under the root (e.g., `LICENSE`).
