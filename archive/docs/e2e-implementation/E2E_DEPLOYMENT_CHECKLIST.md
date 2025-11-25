# E2E Testing Deployment Checklist

## Pre-Deployment (Before Using E2E Tests)

### Environment Setup

- [ ] Create separate TEST Supabase project (never use production)
- [ ] Copy `.env.test.example` to `.env.test` (git-ignored)
- [ ] Fill `.env.test` with TEST Supabase credentials:
  - `NEXT_PUBLIC_SUPABASE_URL` (must contain "test")
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Verify NODE_ENV=test in `.env.test`

### Dependencies

- [ ] Run `pnpm install`
- [ ] Run `pnpm exec playwright install --with-deps`
- [ ] Verify no errors during installation

### Test Run

- [ ] Run `pnpm e2e` (full pipeline)
- [ ] Verify all 11 tests pass
- [ ] Check HTML report opens correctly

### Documentation Review

- [ ] Read [E2E_TESTING_README.md](./E2E_TESTING_README.md)
- [ ] Understand test architecture in [E2E_ORCHESTRATION_GUIDE.md](./E2E_ORCHESTRATION_GUIDE.md)
- [ ] Bookmark [E2E_TROUBLESHOOTING.md](./E2E_TROUBLESHOOTING.md) for issues

---

## Files Deployed

| File                         | Type      | Purpose                    |
| ---------------------------- | --------- | -------------------------- |
| `e2e/auth.e2e.spec.ts`       | Test Code | 11 E2E test cases          |
| `prisma/seed-e2e.ts`         | Script    | Test data seeding          |
| `scripts/reset-test-db.sh`   | Script    | Database reset             |
| `.env.test.example`          | Config    | Template for `.env.test`   |
| `playwright.config.ts`       | Config    | UPDATED: globalSetup added |
| `package.json`               | Config    | UPDATED: npm scripts added |
| `E2E_TESTING_README.md`      | Doc       | Entry point documentation  |
| `E2E_TESTING_SUMMARY.md`     | Doc       | Overview & quick start     |
| `E2E_AUTH_TESTING_GUIDE.md`  | Doc       | Complete reference         |
| `E2E_TROUBLESHOOTING.md`     | Doc       | Problem solving            |
| `E2E_ORCHESTRATION_GUIDE.md` | Doc       | Pipeline & CI/CD           |
| `run-e2e-tests.sh`           | Script    | Interactive test runner    |

---

## npm Scripts Added

```json
{
  "scripts": {
    "db:migrate:test": "NODE_ENV=test dotenv -e .env.test -- npx prisma migrate deploy",
    "db:reset:test": "NODE_ENV=test bash scripts/reset-test-db.sh",
    "db:seed:test": "NODE_ENV=test dotenv -e .env.test -- npx ts-node prisma/seed-e2e.ts",
    "e2e": "NODE_ENV=test dotenv -e .env.test -- playwright test e2e/auth.e2e.spec.ts",
    "e2e:headed": "NODE_ENV=test dotenv -e .env.test -- playwright test e2e/auth.e2e.spec.ts --headed",
    "e2e:debug": "NODE_ENV=test dotenv -e .env.test -- playwright test e2e/auth.e2e.spec.ts --debug",
    "e2e:report": "NODE_ENV=test dotenv -e .env.test -- playwright test e2e/auth.e2e.spec.ts && playwright show-report"
  }
}
```

---

## Local Development Workflow

### First Time

```bash
# Setup
cp .env.test.example .env.test
# Edit .env.test with your test Supabase credentials
pnpm install
pnpm exec playwright install --with-deps

# Test everything works
pnpm e2e
```

### Daily Usage

```bash
# Run all tests (includes seeding)
pnpm e2e

# Faster iteration (skip seeding if already seeded)
SKIP_SEED=true pnpm e2e

# Debug test
pnpm e2e:headed    # See browser
pnpm e2e:debug     # Interactive debugging
```

---

## CI/CD Deployment

### GitHub Actions

Add `.github/workflows/e2e-tests.yml`:

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: pnpm
      - run: pnpm install
      - run: pnpm exec playwright install --with-deps
      - run: pnpm build
      - run: NODE_ENV=test pnpm e2e
        env:
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

### Add GitHub Secrets

Go to: Settings → Secrets and variables → Actions

Add:

- `TEST_SUPABASE_URL` (your test project URL)
- `TEST_SUPABASE_ANON_KEY` (test anon key)
- `TEST_SUPABASE_SERVICE_ROLE_KEY` (test service key)

---

## Verification

### Local Verification

```bash
# All tests pass
pnpm e2e
# Expected: "11 passed (42.5s)"

# Can view report
pnpm exec playwright show-report
# Expected: HTML report opens in browser

# Can debug
pnpm e2e:debug
# Expected: Inspector opens, can step through tests
```

### Production Verification

```bash
# GitHub Actions workflow runs successfully
# (check Actions tab in GitHub repo)

# Test report uploaded as artifact
# (download from Actions run)

# No security issues
# (logs show "SKIP: not a test database" if production attempted)
```

---

## Rollback Plan

If something goes wrong:

### Issue: Tests won't run

```bash
# Step 1: Check environment
echo $NODE_ENV  # Should be "test"
grep "SUPABASE" .env.test  # Should have test URLs

# Step 2: Re-seed database
pnpm db:reset:test
pnpm db:migrate:test
pnpm db:seed:test

# Step 3: Try tests again
pnpm e2e
```

### Issue: Lost .env.test

```bash
# Restore from template
cp .env.test.example .env.test

# Add your test credentials again
nano .env.test
```

### Issue: GitHub Actions failing

```bash
# Check secrets are set correctly
# Go to: Settings → Secrets → TEST_SUPABASE_*

# Verify workflow has correct NODE_ENV=test

# Rerun workflow from GitHub Actions tab
```

### Issue: Need to disable tests temporarily

```bash
# In .github/workflows/e2e-tests.yml
# Comment out the test step:

# - run: NODE_ENV=test pnpm e2e

# Or delete the workflow file temporarily
# rm .github/workflows/e2e-tests.yml
```

---

## Maintenance

### Weekly

- [ ] Verify `pnpm e2e` still passes
- [ ] Check GitHub Actions run logs

### Monthly

- [ ] Review test coverage (11 tests comprehensive?)
- [ ] Update test data if new features added
- [ ] Check Playwright for updates: `pnpm update @playwright/test`

### Quarterly

- [ ] Review performance (tests running < 60s?)
- [ ] Update documentation
- [ ] Add new tests for new features

---

## Support & Escalation

### Common Issues

| Issue            | Command to Fix                            | Docs                       |
| ---------------- | ----------------------------------------- | -------------------------- |
| Tests timeout    | `pnpm e2e:debug`                          | E2E_TROUBLESHOOTING.md     |
| Button not found | `pnpm e2e:headed`                         | E2E_AUTH_TESTING_GUIDE.md  |
| Database error   | `pnpm db:reset:test && pnpm db:seed:test` | E2E_ORCHESTRATION_GUIDE.md |
| CI/CD fails      | Check GitHub secrets                      | E2E_ORCHESTRATION_GUIDE.md |

### Escalation Path

1. **Check docs** → [E2E_TROUBLESHOOTING.md](./E2E_TROUBLESHOOTING.md)
2. **Run in debug mode** → `pnpm e2e:debug`
3. **Check logs** → `pnpm dev` output + `playwright-report/`
4. **Check infrastructure** → Supabase project status
5. **Contact support** → With error message + logs

---

## Success Metrics

✅ **Setup successful when:**

- All 11 tests pass
- No security warnings (test database only)
- `pnpm e2e` completes in < 60 seconds
- HTML report generates correctly

✅ **CI/CD successful when:**

- GitHub Actions workflow runs on every push
- Tests pass or fail consistently
- Artifacts (reports) available after run
- No database locks or timeouts

---

## Sign-Off

- [x] All E2E tests created
- [x] Database seeding automated
- [x] Playwright config updated
- [x] npm scripts added
- [x] Safety guards implemented (NODE_ENV, test-db-only)
- [x] Documentation complete
- [x] CI/CD template provided
- [x] Troubleshooting guide ready
- [x] Local testing verified

**Status: READY FOR PRODUCTION USE**

---

## Quick Reference

```bash
# Setup
cp .env.test.example .env.test
nano .env.test  # Add test Supabase credentials
pnpm install && pnpm exec playwright install --with-deps

# Run tests
pnpm e2e           # Full pipeline: reset → migrate → seed → test
pnpm e2e:headed    # With visible browser
pnpm e2e:debug     # Interactive debugging
pnpm e2e:report    # Run + show HTML report

# Manual steps
pnpm db:reset:test   # Reset test database
pnpm db:migrate:test # Run migrations
pnpm db:seed:test    # Seed test data

# Documentation
cat E2E_TESTING_README.md         # Start here
cat E2E_TESTING_SUMMARY.md        # Overview
cat E2E_AUTH_TESTING_GUIDE.md     # Details
cat E2E_TROUBLESHOOTING.md        # Problems
cat E2E_ORCHESTRATION_GUIDE.md    # Pipeline
```

---

_Deployed: November 17, 2025_  
_Ready for: Local development, CI/CD integration, team usage_
