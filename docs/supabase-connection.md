# Supabase Connection Guide

This doc explains how to keep EcoHub Kosova talking to the hosted Supabase database without the dev server hanging on startup.

## 1. Environment variables

1. **Shell defaults** – `~/.zshrc` now exports:
   - `ECOHUB_SUPABASE_PROJECT_REF=xjyseqtfuxcuviiankhy`
   - `ECOHUB_SUPABASE_DB_USER=postgres.xjyseqtfuxcuviiankhy`
   - `ECOHUB_SUPABASE_DB_HOST=aws-1-eu-west-1.pooler.supabase.com`
   - `ECOHUB_SUPABASE_DB_PORT=6543`
   - `SUPABASE_DB_URL=postgresql://postgres.xjyseqtfuxcuviiankhy:***@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require`

   Open a new terminal (or `source ~/.zshrc`) so `pnpm dev`, Supabase CLI, and `psql` all reuse the same URL.

2. **App config** – keep `.env.local` in the repo with:
   ```ini
   NEXT_PUBLIC_SUPABASE_URL="https://xjyseqtfuxcuviiankhy.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="…"
   SUPABASE_SERVICE_ROLE_KEY="…"
   SUPABASE_DB_URL="${SUPABASE_DB_URL:-postgresql://postgres.xjyseqtfuxcuviiankhy:***@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require}"
   ```
   The fallback keeps Next.js happy even if the shell didn’t export the URL.

## 2. Quick connectivity check

Use the helper function that now lives in `~/.zshrc`:

```bash
ecohub_supabase_ping    # runs PGCONNECT_TIMEOUT=5 psql "$SUPABASE_DB_URL" -c '\dt'
```

You should see a table listing. If it fails:

- Re-run `pnpm dlx supabase login` & `pnpm dlx supabase link --project-ref xjyseqtfuxcuviiankhy --password "$SUPABASE_DB_PASSWORD"` if the CLI needs new credentials.
- Verify network access: `nc -vz $ECOHUB_SUPABASE_DB_HOST $ECOHUB_SUPABASE_DB_PORT`. If it times out, try another network or use Supabase’s SSH tunnel snippet from the dashboard.

## 3. Running the app without hangs

`src/lib/drizzle.ts` creates the Postgres connection as soon as the server starts. If `SUPABASE_DB_URL` points at a blocked port, `pnpm dev` will freeze. After confirming the ping works:

```bash
pnpm install   # once
pnpm dev
```

Because the URL now targets the Supabase connection pool (`aws-1-eu-west-1.pooler.supabase.com:6543`), the handshake finishes immediately and the app boots normally.

## 4. Supabase CLI + migrations

- Docker Desktop must be running for `pnpm db:sync`/`supabase db diff` (the CLI still spins up a local shadow DB even when pointing at the hosted instance).
- Schema workflow:
  ```bash
  pnpm dlx supabase db diff -f add-columns
  pnpm dlx supabase db push
  pnpm drizzle:generate
  ```
- SQLite-style Drizzle migrations aren’t used; always rely on Supabase CLI + `supabase/migrations/**`.

## 5. Troubleshooting checklist

| Symptom | Fix |
| --- | --- |
| `psql` says “Tenant or user not found” | You’re hitting the pool host with the wrong username. Always copy the exact URI from Project Settings → Database → Connection info. |
| `psql`/`pnpm dev` time out | Network is blocking the pool port. Use another network (hotspot), a VPN, or the Supabase SSH tunnel command. |
| `pnpm db:sync` fails with Docker error | Start Docker Desktop first; the CLI needs it for shadow databases. |
| Supabase CLI commands demand login | `pnpm dlx supabase login` and re-run the command; the linked project is `xjyseqtfuxcuviiankhy`. |

With the shell exports + ping helper in place, you can quickly confirm connectivity before running `pnpm dev`, `pnpm db:sync`, or any scripts that touch Supabase.
