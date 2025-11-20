# E2E Test Orchestration & Database Seeding

## Overview

This document explains the complete E2E testing pipeline with automatic database seeding. The orchestration ensures:

✅ **Safe**: Only touches test database (not production)  
✅ **Deterministic**: Same seed data every run  
✅ **Idempotent**: Re-running is safe and yields same results  
✅ **Fast**: Automated setup with clear diagnostics  
✅ **Observable**: Logs show exactly what happened  

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ Developer runs: pnpm e2e                                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ playwright.config.ts (globalSetup hook)                     │
│  • Validates NODE_ENV=test                                  │
│  • Checks DATABASE_URL contains "test"                      │
│  • Runs pnpm db:reset:test (Prisma reset)                   │
│  • Runs pnpm db:migrate:test (apply migrations)             │
│  • Runs pnpm db:seed:test (insert test data)                │
│  • Verifies sanity checks pass                              │
└─────────────────────────────────────────────────────────────┘
                          ↓
             ✅ Database seeded & ready
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Playwright runs E2E tests                                   │
│  • Uses deterministic test credentials                      │
│  • Tests auth flow with seeded data                         │
│  • Generates HTML report                                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
             ✅ Tests pass/fail with clear reports
```

---

## Setup Steps

### 1. Create Test Environment File

```bash
cp .env.test.example .env.test
```

Then edit `.env.test`:

```env
NODE_ENV=test

# Your TEST Supabase credentials (not production!)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-test.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-test-key...
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-test-service-key...

# Test user (will be created by seed script)
TEST_USER_EMAIL=admin@e2e.test
TEST_USER_PASSWORD=AdminPassword123!

# Test app URL
TEST_BASE_URL=http://localhost:3000
TEST_LOCALE=sq
```

**⚠️ CRITICAL SAFETY CHECKS:**

- `NEXT_PUBLIC_SUPABASE_URL` **must** contain `test` (e.g., `...test.supabase.co`)
- `NODE_ENV` **must** be `test`
- Scripts will refuse to run against production databases

### 2. Install Dependencies

```bash
pnpm install
pnpm exec playwright install --with-deps
```

### 3. Verify Setup

```bash
# Check environment is valid
echo "NODE_ENV: $NODE_ENV"
echo "TEST_USER_EMAIL: $TEST_USER_EMAIL"

# Verify Supabase connectivity
curl -H "Authorization: Bearer $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/users?limit=1"
```

---

## Running Tests

### Option 1: Automatic Seeding (Recommended)

```bash
# Everything in one command:
# 1. Resets database
# 2. Runs migrations
# 3. Seeds test data
# 4. Runs E2E tests
# 5. Shows report

pnpm e2e
```

### Option 2: Manual Steps

```bash
# Step 1: Reset database
pnpm db:reset:test

# Step 2: Run migrations
pnpm db:migrate:test

# Step 3: Seed test data
pnpm db:seed:test

# Step 4: Run tests
pnpm e2e
```

### Option 3: Development Mode (Faster Iteration)

```bash
# Skip seeding, just run tests (if data already seeded)
SKIP_SEED=true pnpm e2e

# Or with headed browser to debug
pnpm e2e:headed

# Or in interactive debug mode
pnpm e2e:debug

# View HTML report
pnpm e2e:report
```

---

## Database Seeding Details

### What Gets Seeded

**prisma/seed-e2e.ts** creates deterministic test data:

#### Users (3 total)

```javascript
// Admin user
{
  id: 'e2e_admin_001',
  email: 'admin@e2e.test',
  password: 'AdminPassword123!',
  fullName: 'Admin User',
  role: 'admin',
}

// Regular user
{
  id: 'e2e_user_001',
  email: 'user@e2e.test',
  password: 'UserPassword123!',
  fullName: 'Regular User',
  role: 'user',
}

// Viewer user
{
  id: 'e2e_viewer_001',
  email: 'viewer@e2e.test',
  password: 'ViewerPassword123!',
  fullName: 'Viewer User',
  role: 'viewer',
}
```

#### Organizations (1 total)

```javascript
{
  id: 'org_e2e_test_001',
  name: 'E2E Test Organization',
  slug: 'e2e-test-org',
  description: 'Organization for E2E testing',
}
```

### Idempotency

The seed script is **idempotent**: running it multiple times yields the same dataset.

```typescript
// Uses upsert: creates if missing, skips if exists
await supabase
  .from('users')
  .upsert({ email: 'admin@e2e.test', ... });
```

**Benefit**: Safe to re-run. Old test data doesn't accumulate.

### Sanity Checks

After seeding, the script verifies:

- ✅ Users >= 3
- ✅ Organizations >= 1
- ✅ Test admin exists (admin@e2e.test)
- ✅ All records have valid IDs and timestamps

If any check fails, the seed script exits with non-zero status and reports the issue.

---

## Safety Mechanisms

### 1. Environment Validation

```bash
# Fails if DATABASE_URL doesn't contain "test"
if [[ ! "$DATABASE_URL" == *"_test"* ]]; then
  echo "ERROR: Not a test database. Aborting."
  exit 1
fi
```

### 2. NODE_ENV Check

```bash
if [[ "$NODE_ENV" != "test" ]]; then
  echo "ERROR: NODE_ENV must be 'test', got '$NODE_ENV'"
  exit 1
fi
```

### 3. Playwright Global Setup

```typescript
// globalSetup in playwright.config.ts
async function globalSetup() {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('NODE_ENV must be "test"');
  }
  // ... run seeding ...
}
```

**Result**: Tests cannot accidentally target production.

---

## Troubleshooting

### Issue: "CRITICAL: DATABASE_URL does not look like a test database"

**Solution**: Update `.env.test` to use test Supabase project:

```bash
# Wrong (production):
NEXT_PUBLIC_SUPABASE_URL=https://my-project.supabase.co

# Correct (test):
NEXT_PUBLIC_SUPABASE_URL=https://my-project-test.supabase.co
```

### Issue: Seed script says "Database reset failed"

**Causes**:
- Prisma schema is out of sync with database
- Supabase project doesn't have tables
- Service role key doesn't have permissions

**Solution**:

```bash
# Option 1: Apply migrations manually
pnpm db:migrate:test

# Option 2: Check Supabase project (in browser)
# https://app.supabase.com -> Project -> SQL Editor
# Run: SELECT * FROM information_schema.tables;

# Option 3: Verify permissions
# Service role key should have admin access to test DB
```

### Issue: Seed sanity check fails ("users < 3")

**Cause**: Seed script ran but didn't insert all users

**Debug**:

```bash
# Check database directly
# In Supabase UI: SQL Editor
SELECT email, role FROM user_profiles;

# Should show 3 rows:
# admin@e2e.test, admin
# user@e2e.test, user
# viewer@e2e.test, viewer
```

**Solution**:

```bash
# Manual retry
pnpm db:reset:test
pnpm db:migrate:test
pnpm db:seed:test --verbose
```

### Issue: Tests pass but report missing users

**Cause**: E2E test credentials don't match seeded data

**Check**:

```bash
# Verify .env.test matches seed data
grep "TEST_USER_EMAIL=" .env.test
# Should show: admin@e2e.test

# OR use different user
TEST_USER_EMAIL=user@e2e.test pnpm e2e
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test
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
          node-version: 18
          cache: pnpm
      
      - run: pnpm install
      - run: pnpm exec playwright install --with-deps
      
      - run: pnpm build
      
      # Run E2E tests with auto-seeding
      - run: NODE_ENV=test pnpm e2e
        env:
          # Set these in GitHub Secrets
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.TEST_SUPABASE_ANON_KEY }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.TEST_SUPABASE_SERVICE_ROLE_KEY }}
      
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 14
```

### Set GitHub Secrets

1. Go to repo Settings → Secrets and variables → Actions
2. Add:
   - `TEST_SUPABASE_URL` → your test project URL
   - `TEST_SUPABASE_ANON_KEY` → your test anon key
   - `TEST_SUPABASE_SERVICE_ROLE_KEY` → your test service key

3. Update workflow `.env.test`:
   ```yaml
   - run: NODE_ENV=test pnpm e2e
     env:
       NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
       # ...
   ```

---

## Performance

### Typical Timings

| Step | Time | Notes |
|------|------|-------|
| Database reset | ~2s | Prisma migration |
| Migrations | ~1s | Usually cached |
| Seeding | ~3s | 3 users, 1 org |
| E2E tests (11 tests) | ~40s | Depends on network |
| **Total** | **~50s** | Runs only once per test session |

### Optimization Tips

1. **Skip seeding if unchanged**:
   ```bash
   SKIP_SEED=true pnpm e2e  # Uses existing seed
   ```

2. **Run tests in parallel** (playwright.config.ts):
   ```typescript
   workers: 4,  // Use 4 browser processes
   ```

3. **Only seed once per session**:
   Playwright's `globalSetup` runs once before all tests, not per test.

---

## File Structure

```
ecohubkosova/
├── .env.test                     # Test environment (git-ignored)
├── .env.test.example             # Template for .env.test
├── playwright.config.ts          # Playwright config + globalSetup
├── e2e/
│   ├── auth.e2e.spec.ts         # E2E test suite
│   ├── pages/
│   ├── helpers/
│   └── fixtures.ts
├── prisma/
│   ├── seed-e2e.ts              # E2E seed script
│   ├── schema.prisma
│   └── migrations/
├── scripts/
│   └── reset-test-db.sh          # Database reset script
└── package.json                  # npm scripts

Key scripts in package.json:
  pnpm db:reset:test      # Reset database
  pnpm db:migrate:test    # Run migrations
  pnpm db:seed:test       # Seed data
  pnpm e2e                # All-in-one: reset → migrate → seed → test
  pnpm e2e:headed         # Run with visible browser
  pnpm e2e:debug          # Interactive debugging
  pnpm e2e:report         # Run tests + open HTML report
```

---

## Best Practices

### ✅ DO:

- Use deterministic IDs (not UUIDs) for test data
- Use fixed emails/passwords for reproducibility
- Test with upsert (idempotent)
- Validate sanity checks before running tests
- Document test credentials in seed comments
- Use separate test Supabase project
- Run globalSetup before each test session
- Log seeding summary with row counts

### ❌ DON'T:

- Use real production URLs in .env.test
- Commit .env.test with real credentials
- Create random UUIDs or timestamps in seed
- Re-seed per test (globalSetup runs once)
- Run tests without environment validation
- Trust that seeding succeeded without sanity checks
- Modify test data mid-test (use fixtures instead)

---

## Quick Reference

```bash
# Development (local)
pnpm e2e                    # Full pipeline: reset → migrate → seed → test
pnpm e2e:headed             # With browser visible
pnpm e2e:debug              # Interactive debugger

# CI/CD (GitHub Actions)
NODE_ENV=test pnpm e2e      # Full pipeline in CI

# Manual steps
pnpm db:reset:test          # Delete and recreate schema
pnpm db:migrate:test        # Apply pending migrations
pnpm db:seed:test           # Insert test data
pnpm test:e2e               # Run Playwright tests only

# Troubleshooting
SKIP_SEED=true pnpm e2e     # Skip seeding (test manually)
DEBUG_AUTH=true pnpm e2e    # Verbose auth logging
```

---

## Related Docs

- [E2E Testing Guide](./E2E_AUTH_TESTING_GUIDE.md) - Complete testing reference
- [Troubleshooting](./E2E_TROUBLESHOOTING.md) - Common issues & fixes
- [Playwright Docs](https://playwright.dev/docs/global-setup-teardown)
- [Prisma Seeding](https://www.prisma.io/docs/guides/seed-your-database)

---

## Questions?

1. **"Can I use this with a real Supabase project?"** Yes, create a separate test project in Supabase.

2. **"What if seeding fails?"** The global setup hook catches errors and exits with non-zero status (CI will fail).

3. **"Can I skip seeding for local testing?"** Yes: `SKIP_SEED=true pnpm e2e`

4. **"Do I need to seed per-worker?"** No, `globalSetup` runs once per session for all workers.

5. **"How do I verify seed succeeded?"** Look for "✅ Seed Complete" in console and check row counts.

---

*Last updated: November 17, 2025*
*For ecohubkosova E2E testing pipeline*
