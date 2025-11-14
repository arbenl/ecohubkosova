# Database Migrations

EcoHub Kosova now tracks its Supabase schema via the Supabase CLI inside the `supabase/` directory. This document explains how to manage migrations locally and how to apply them to the hosted project.

## Prerequisites

1. **Supabase CLI** – either install globally (`brew install supabase/tap/supabase`) or run the on-demand version the repo uses:
   ```bash
   pnpm dlx supabase <command>
   ```
2. **Access token** – grab a personal access token from the Supabase dashboard (Profile → Access Tokens).
3. **Database password** – the project’s DB password from Project Settings → Database → Connection info.
4. **Database URL (`SUPABASE_DB_URL`)** – the full Postgres connection string (shows up in the Supabase dashboard). Store it in your `.env.local`; it’s required for Drizzle ORM and for future CLI automation.

## One-time setup

```bash
# Authenticate the CLI (opens browser flow if needed)
pnpm dlx supabase login

# Link the local repo to the hosted project
pnpm dlx supabase link \
  --project-ref xjyseqtfuxcuviiankhy \
  --password "$SUPABASE_DB_PASSWORD"
```

The `--project-ref` matches `NEXT_PUBLIC_SUPABASE_URL`, and the password can be exported as an env var (recommended) so you don’t pass it in plain text.

## Working locally

1. **Start the local stack (optional):**
   ```bash
   pnpm dlx supabase start
   ```
2. **Reset database + seed data:**
   ```bash
   pnpm dlx supabase db reset
   ```
   This applies everything under `supabase/migrations/**` and then runs `supabase/seed.sql`.
3. **Stop the stack when you are done:**
   ```bash
   pnpm dlx supabase stop
   ```

## Creating a new migration

1. Make your schema changes against the local database (e.g., via `psql` or Supabase Studio on the local stack).
2. Diff the changes into a migration file:
   ```bash
   pnpm dlx supabase db diff -f add-my-table
   ```
   This writes a timestamped SQL file into `supabase/migrations/`.
3. Inspect/tidy the SQL, commit it to git, and push as part of your feature branch.

## Applying to the hosted Supabase project

After your branch lands:

```bash
pnpm dlx supabase db push
```

This replays any new migrations against the linked remote database. The Supabase CLI stores the migration history in the project’s `supabase_migrations.schema_migrations` table, so replays remain idempotent.

## Legacy scripts folder

The previous hand-written SQL lives under `scripts/` for reference, but those files are now superseded by:

- `supabase/migrations/20251114161023_initial_schema.sql`
- `supabase/migrations/20251114162023_rls_policies.sql`
- `supabase/seed.sql`

Don’t edit the `scripts/` files going forward; always generate new migrations through the CLI so every change is traceable and reproducible.
