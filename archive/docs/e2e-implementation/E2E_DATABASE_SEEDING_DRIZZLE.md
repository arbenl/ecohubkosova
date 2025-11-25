# E2E Database Seeding for ecohubkosova (Drizzle + Supabase)

## Overview

This guide sets up deterministic, idempotent database seeding for your E2E tests using Drizzle ORM and Supabase.

**Key Principle**: Tests always run against a clean, known dataset.

---

## Part 1: Claude Tasking Prompt

Use this as a system message when asking Claude/AI to help with E2E seeding orchestration:

```
You are a build/test orchestrator for e2e runs. Your job:
- Reset and seed the TEST database before e2e, never touching production.
- Verify seed success, then launch the e2e runner.
- If seeding fails, stop tests and print actionable diagnostics.

Hard constraints:
- Work only with NODE_ENV=test (or TEST_DB=true). Refuse if any prod URL/key is detected.
- Idempotent seeding: re-running yields the same dataset.
- Deterministic records: fixed IDs/emails, stable timestamps.

Actions (in order):
1) Load .env.test and verify DB URL points to test instance.
2) Run schema migrations using Drizzle (drizzle-kit push).
3) Run the seed script with deterministic data.
4) Sanity-check (e.g., users >= 2, organizations >= 1). If checks fail, abort with logs.
5) Start the e2e runner. Optionally re-seed per worker if required.
6) On failure, dump last 200 lines of migration/seed logs and exit non-zero.

Outputs:
- A short seeding summary (rows per table, timing).
- Clear next steps if validation fails.
```

---

## Part 2: Project-Specific Setup

### Step 1: Create `.env.test`

In the root of your project, create `.env.test`:

```bash
# .env.test
NODE_ENV=test
TEST_DB=true

# CRITICAL: Must point to TEST Supabase project, NOT production
SUPABASE_DB_URL=postgresql://postgres:[password]@localhost:54322/postgres
# OR for remote test DB:
# SUPABASE_DB_URL=postgresql://postgres:[password]@your-test-db.supabase.co:5432/postgres

# Optional: Use Supabase local for fastest tests
# SUPABASE_DB_URL=postgresql://postgres:postgres@localhost:54322/postgres
```

**⚠️ CRITICAL SAFETY CHECK:**

- Verify the DB URL contains `_test` or `test` in the database name
- Never use production credentials here
- Add `.env.test` to `.gitignore` if it contains real passwords

### Step 2: Add npm Scripts

Update `package.json`:

```json
{
  "scripts": {
    "db:push:test": "NODE_ENV=test npx drizzle-kit push",
    "db:seed:test": "NODE_ENV=test tsx src/db/seed.ts",
    "db:reset:test": "bash scripts/reset-test-db.sh",
    "e2e": "playwright test",
    "e2e:with-seed": "pnpm db:reset:test && pnpm db:push:test && pnpm db:seed:test && pnpm e2e"
  }
}
```

### Step 3: Create Drizzle Seed Script

Create `src/db/seed.ts`:

```typescript
// src/db/seed.ts
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { users, organizations, organizationMembers, articles, marketplaceListings } from "./schema"
import { randomUUID } from "crypto"

// Safety check: refuse to run against production
const dbUrl = process.env.SUPABASE_DB_URL
if (!dbUrl) {
  throw new Error("SUPABASE_DB_URL not set")
}
if (dbUrl.includes("supabase.co") && !dbUrl.includes("_test")) {
  throw new Error(
    "SAFETY ABORT: DB URL does not contain '_test'. Refusing to seed production database."
  )
}

const client = postgres(dbUrl)
const db = drizzle(client)

// Fixed IDs for deterministic test data
const TEST_USER_ADMIN_ID = "11111111-1111-1111-1111-111111111111"
const TEST_USER_VIEWER_ID = "22222222-2222-2222-2222-222222222222"
const TEST_USER_MEMBER_ID = "33333333-3333-3333-3333-333333333333"
const TEST_ORG_ID = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"

async function seed() {
  console.log("🌱 Starting database seed (TEST)...")
  const startTime = Date.now()

  try {
    // 1. Create test users (deterministic)
    console.log("→ Creating test users...")
    await db
      .insert(users)
      .values([
        {
          id: TEST_USER_ADMIN_ID,
          emri_i_plote: "Admin Test",
          email: "admin@test.local",
          vendndodhja: "Prishtinë",
          roli: "admin",
          eshte_aprovuar: true,
          session_version: 1,
          created_at: new Date("2025-01-01T10:00:00Z"),
          updated_at: new Date("2025-01-01T10:00:00Z"),
        },
        {
          id: TEST_USER_VIEWER_ID,
          emri_i_plote: "Viewer Test",
          email: "viewer@test.local",
          vendndodhja: "Gjakovë",
          roli: "user",
          eshte_aprovuar: true,
          session_version: 1,
          created_at: new Date("2025-01-01T11:00:00Z"),
          updated_at: new Date("2025-01-01T11:00:00Z"),
        },
        {
          id: TEST_USER_MEMBER_ID,
          emri_i_plote: "Member Test",
          email: "member@test.local",
          vendndodhja: "Prizren",
          roli: "user",
          eshte_aprovuar: true,
          session_version: 1,
          created_at: new Date("2025-01-01T12:00:00Z"),
          updated_at: new Date("2025-01-01T12:00:00Z"),
        },
      ])
      .onConflictDoUpdate({
        target: [users.email],
        set: { updated_at: new Date() },
      })

    console.log("✓ Users created")

    // 2. Create test organization
    console.log("→ Creating test organization...")
    await db
      .insert(organizations)
      .values({
        id: TEST_ORG_ID,
        emri: "Test Organization",
        pershkrimi: "Organization for E2E testing",
        interesi_primar: "Mjedisum",
        person_kontakti: "Admin Test",
        email_kontakti: "admin@test.local",
        vendndodhja: "Prishtinë",
        lloji: "OJQ",
        eshte_aprovuar: true,
        created_at: new Date("2025-01-01T10:00:00Z"),
        updated_at: new Date("2025-01-01T10:00:00Z"),
      })
      .onConflictDoUpdate({
        target: [organizations.email_kontakti],
        set: { updated_at: new Date() },
      })

    console.log("✓ Organization created")

    // 3. Link users to organization
    console.log("→ Adding members to organization...")
    await db
      .insert(organizationMembers)
      .values([
        {
          id: randomUUID(),
          organization_id: TEST_ORG_ID,
          user_id: TEST_USER_ADMIN_ID,
          roli_ne_organizate: "admin",
          eshte_aprovuar: true,
          created_at: new Date(),
        },
        {
          id: randomUUID(),
          organization_id: TEST_ORG_ID,
          user_id: TEST_USER_MEMBER_ID,
          roli_ne_organizate: "member",
          eshte_aprovuar: true,
          created_at: new Date(),
        },
      ])
      .onConflictDoNothing()

    console.log("✓ Organization members added")

    // 4. Create test articles
    console.log("→ Creating test articles...")
    await db
      .insert(articles)
      .values({
        id: randomUUID(),
        titulli: "Test Article: Environment Protection",
        permbajtja: "This is a test article about environmental protection strategies.",
        autori_id: TEST_USER_ADMIN_ID,
        eshte_publikuar: true,
        kategori: "Mjedisum",
        tags: ["environment", "testing", "e2e"],
        foto_kryesore: "https://example.com/test-image.jpg",
        created_at: new Date("2025-01-05T10:00:00Z"),
        updated_at: new Date("2025-01-05T10:00:00Z"),
      })
      .onConflictDoNothing()

    console.log("✓ Test articles created")

    // 5. Create test marketplace listings
    console.log("→ Creating test marketplace listings...")
    await db
      .insert(marketplaceListings)
      .values({
        id: randomUUID(),
        created_by_user_id: TEST_USER_ADMIN_ID,
        organization_id: TEST_ORG_ID,
        titulli: "Recycled Materials - Test Listing",
        pershkrimi: "High-quality recycled materials available for purchase.",
        kategori: "Materiale",
        cmimi: "100.00",
        njesia: "kg",
        vendndodhja: "Prishtinë",
        sasia: "500",
        lloji_listimit: "oferim",
        foto: null,
        active: true,
        created_at: new Date("2025-01-10T10:00:00Z"),
        updated_at: new Date("2025-01-10T10:00:00Z"),
      })
      .onConflictDoNothing()

    console.log("✓ Marketplace listings created")

    // 6. Sanity checks
    console.log("\n🔍 Running sanity checks...")
    const userCount = await db.$count(users)
    const orgCount = await db.$count(organizations)
    const memberCount = await db.$count(organizationMembers)

    console.log(`  ✓ Users: ${userCount}`)
    console.log(`  ✓ Organizations: ${orgCount}`)
    console.log(`  ✓ Organization Members: ${memberCount}`)

    if (userCount < 3) {
      throw new Error(`Seed validation failed: Expected >= 3 users, got ${userCount}`)
    }
    if (orgCount < 1) {
      throw new Error(`Seed validation failed: Expected >= 1 organization, got ${orgCount}`)
    }

    const duration = Date.now() - startTime
    console.log(`\n✅ Seeding complete in ${duration}ms`)
    console.log("\nTest Data Summary:")
    console.log(`  Admin User: admin@test.local`)
    console.log(`  Viewer User: viewer@test.local`)
    console.log(`  Member User: member@test.local`)
    console.log(`  Test Organization: Test Organization`)
    console.log(`\nReady for E2E testing!`)
  } catch (error) {
    console.error("\n❌ Seed failed:")
    console.error(error instanceof Error ? error.message : String(error))

    if (error instanceof Error && error.message.includes("SAFETY ABORT")) {
      console.error("\n🛑 SAFETY CHECK FAILED - Refusing to proceed")
    }

    process.exit(1)
  } finally {
    await client.end()
  }
}

seed()
```

### Step 4: Update Reset Script

Update `scripts/reset-test-db.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

# Safety check: ensure we're using test database
DB_URL="${SUPABASE_DB_URL:-}"
if [ -z "$DB_URL" ]; then
  echo "❌ SUPABASE_DB_URL not set"
  exit 1
fi

if [[ "$DB_URL" != *"_test"* ]] && [[ "$DB_URL" != *"localhost"* ]]; then
  echo "❌ SAFETY ABORT: DB URL doesn't contain '_test' or 'localhost'"
  echo "   Refusing to reset - this doesn't look like a test database"
  echo "   DB_URL: $DB_URL"
  exit 1
fi

echo "🔄 Resetting test database..."
echo "   URL: $DB_URL"

# Drop all tables and rebuild schema
npx drizzle-kit drop --config drizzle.config.ts --out ./drizzle || true

echo "✅ Test database reset complete"
```

### Step 5: Update Drizzle Config

Ensure `drizzle.config.ts` respects NODE_ENV:

```typescript
import { defineConfig } from "drizzle-kit"

const dbUrl =
  process.env.SUPABASE_DB_URL ??
  (process.env.NODE_ENV === "test"
    ? "postgresql://postgres:postgres@localhost:54322/postgres"
    : process.env.SUPABASE_DB_URL)

if (!dbUrl) {
  throw new Error(
    "SUPABASE_DB_URL not set. Set NODE_ENV=test for test DB, or configure production URL."
  )
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl,
  },
})
```

### Step 6: Update playwright.config.ts

Integrate seeding into Playwright config:

```typescript
import { defineConfig, devices } from "@playwright/test"
import { execSync } from "node:child_process"

function seedDatabase() {
  // Safety: ensure NODE_ENV is test
  if (process.env.NODE_ENV !== "test") {
    console.error("❌ NODE_ENV must be 'test' to run E2E tests")
    process.exit(1)
  }

  console.log("\n🌱 Seeding test database before E2E tests...\n")

  try {
    // Reset database
    console.log("Step 1: Resetting database...")
    execSync("bash scripts/reset-test-db.sh", { stdio: "inherit" })

    // Run migrations
    console.log("\nStep 2: Running migrations...")
    execSync("pnpm db:push:test", { stdio: "inherit" })

    // Seed data
    console.log("\nStep 3: Seeding test data...")
    execSync("pnpm db:seed:test", { stdio: "inherit" })

    console.log("\n✅ Database ready for E2E tests\n")
  } catch (error) {
    console.error("\n❌ Seeding failed. Aborting E2E tests.")
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    navigationTimeout: 15000,
    actionTimeout: 10000,
  },
  timeout: 30000,
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  globalSetup: async () => {
    // Only seed if not in CI or if explicitly requested
    if (!process.env.SKIP_SEED) {
      seedDatabase()
    }
  },
  webServer: process.env.SKIP_WEB_SERVER
    ? undefined
    : {
        command: "pnpm exec next build && pnpm exec next start --hostname 127.0.0.1 --port 3000",
        url: "http://127.0.0.1:3000",
        reuseExistingServer: true,
        timeout: 60000,
      },
})
```

---

## Part 3: Running E2E Tests with Seeding

### Local Development

```bash
# Set up test environment
export NODE_ENV=test
export SUPABASE_DB_URL="postgresql://postgres:postgres@localhost:54322/postgres"

# Option 1: Full workflow (reset → migrate → seed → test)
pnpm e2e:with-seed

# Option 2: Manual steps
pnpm db:reset:test
pnpm db:push:test
pnpm db:seed:test
pnpm e2e

# Option 3: Just seed (after manual reset)
pnpm db:seed:test
```

### CI/CD (GitHub Actions)

```yaml
name: E2E Tests with Seeding

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: postgres_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "pnpm"

      - run: pnpm install
      - run: pnpm exec playwright install --with-deps

      - name: Seed database
        env:
          NODE_ENV: test
          SUPABASE_DB_URL: postgresql://postgres:postgres@localhost:5432/postgres_test
        run: |
          pnpm db:reset:test
          pnpm db:push:test
          pnpm db:seed:test

      - name: Build app
        run: pnpm build

      - name: Run E2E tests
        env:
          NODE_ENV: test
          SUPABASE_DB_URL: postgresql://postgres:postgres@localhost:5432/postgres_test
          TEST_USER_EMAIL: admin@test.local
          TEST_USER_PASSWORD: admin123
        run: pnpm e2e

      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Part 4: Test User Credentials

After seeding, these users are available:

| Email               | Password        | Role  | Organization      |
| ------------------- | --------------- | ----- | ----------------- |
| `admin@test.local`  | (Supabase auth) | admin | Test Organization |
| `viewer@test.local` | (Supabase auth) | user  | None              |
| `member@test.local` | (Supabase auth) | user  | Test Organization |

**Note**: With Supabase auth, test users are created via Supabase's auth API, not directly in the database. For truly deterministic passwords, you have two options:

### Option A: Use Supabase Service Role to Create Test Users

Add to `src/db/seed.ts`:

```typescript
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Create test users in auth
await supabase.auth.admin.createUser({
  email: "admin@test.local",
  password: "TestAdmin123!",
  email_confirm: true,
})
```

### Option B: Pre-seed Supabase Auth

Use Supabase dashboard to create test users before running tests:

1. Go to Supabase Dashboard → Authentication
2. Create users: `admin@test.local`, `viewer@test.local`, `member@test.local`
3. Set deterministic passwords
4. Confirm their emails

---

## Part 5: Verification Checklist

- [ ] `.env.test` created with test DB URL
- [ ] `src/db/seed.ts` uses deterministic IDs and data
- [ ] `scripts/reset-test-db.sh` has safety checks (refuses production DB)
- [ ] `package.json` has `db:push:test`, `db:seed:test`, `e2e:with-seed` scripts
- [ ] `playwright.config.ts` calls `seedDatabase()` in `globalSetup`
- [ ] Tested locally: `pnpm e2e:with-seed` completes successfully
- [ ] Test data is visible in test runs

---

## Part 6: Troubleshooting

### Error: "SAFETY ABORT: DB URL doesn't contain '\_test'"

**Fix**: Ensure your `.env.test` has `_test` in the database name:

```bash
# ✅ Good
SUPABASE_DB_URL=postgresql://user:pass@localhost:5432/mydb_test

# ❌ Bad
SUPABASE_DB_URL=postgresql://user:pass@localhost:5432/mydb
```

### Error: "Connection refused" or "Database not found"

**Fix**: Ensure Supabase local or PostgreSQL is running:

```bash
# For Supabase local:
supabase start

# For local PostgreSQL:
brew services start postgresql
```

### Seed data not appearing in tests

**Fix**: Verify seeding ran successfully:

```bash
NODE_ENV=test pnpm db:seed:test
```

Check logs for errors. If users table is empty, seeding didn't run or failed silently.

### Tests pass locally but fail in CI

**Fix**: Ensure CI has same environment variables:

```yaml
env:
  NODE_ENV: test
  SUPABASE_DB_URL: ${{ secrets.TEST_DB_URL }}
  SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.TEST_SERVICE_ROLE_KEY }}
```

---

## Summary

You now have:

- ✅ Deterministic test data seeding with Drizzle
- ✅ Safety checks to prevent production DB reset
- ✅ Automatic seeding before E2E tests
- ✅ CI/CD integration example
- ✅ Clear test user credentials

**Run now**:

```bash
export NODE_ENV=test
pnpm e2e:with-seed
```
