# EcoHub Kosova - Deployment Readiness Guide

## Required Environment Variables

### Supabase (Required)

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side only)
- `SUPABASE_DB_URL` - Supabase database connection string (pooler port 6543)

### Sentry (Optional - Monitoring)

- `SENTRY_DSN` - Sentry project DSN
- `SENTRY_ORG` - Sentry organization slug
- `SENTRY_PROJECT` - Sentry project slug

### Next.js (Auto-configured)

- `NODE_ENV` - Environment (production/development/test)

## Local Verification

### 1. Build Health Check

```bash
pnpm lint && pnpm tsc --noEmit && pnpm build
```

**Expected**: All pass, ~18-20 seconds

### 2. Smoke Tests

```bash
pnpm test:e2e:smoke
```

**Expected**: 7/7 tests pass, ~2-3 minutes

### 3. Full E2E Suite (Optional)

```bash
pnpm test:e2e
```

**Expected**: Most pass, some visual regression/analytics may fail (acceptable)

## Vercel Deployment

### Build Configuration

- **Build Command**: `pnpm run build`
- **Install Command**: `pnpm install`
- **Node Version**: 20
- **Framework**: Next.js 16.0.3

### Environment Variables Setup

1. Go to Vercel Project Settings → Environment Variables
2. Add all required variables listed above
3. Set scope: Production, Preview, Development (as needed)

### Post-Deployment Verification

1. Check `/en/marketplace` loads
2. Check `/sq/marketplace` loads (i18n)
3. Check `/en/partners` loads
4. Check `/en/how-it-works` loads
5. Verify header navigation works
6. Test mobile responsive (Chrome DevTools)

## Rollback Procedures

### Git-Based Rollback

```bash
# Option 1: Revert last commit
git revert HEAD
git push origin ecohub-v2-clean

# Option 2: Hard reset to previous tag
git reset --hard ecohub-full-archive-2025-11-25
git push origin ecohub-v2-clean --force
```

### Vercel-Based Rollback

1. Go to Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"
4. Confirm promotion

**Recommendation**: Always tag releases before deploying:

```bash
git tag production-$(date +%Y%m%d-%H%M%S)
git push origin --tags
```

## CI/CD Pipeline

### Tier A (Blocking - Must Pass)

- Lint check (~300ms)
- TypeScript check (~2s)
- Build (~16s)
- Smoke tests (~2-3min)

**Total**: ~3-4 minutes

### Tier B (Non-Blocking - Informational)

- Full E2E suite (39 specs)
- Visual regression
- Performance benchmarks

**Total**: ~10-15 minutes (manual trigger)

## Known Issues & Workarounds

### Organization Analytics Tests Failing

**Issue**: Selectors may be stale or data not seeded  
**Workaround**: Tests are Tier B only (non-blocking)  
**Fix**: Update selectors to use data-testid (future work)

### Visual Regression Tests Failing

**Issue**: Expected after UI polish  
**Workaround**: Update baselines or skip until UI stable  
**Fix**: Re-run visual tests when UI finalized (future work)

## Support

- **Documentation**: `/docs` directory
- **Architecture**: `/docs/architecture-plan.md`
- **Supabase Connection**: `/docs/supabase-connection.md`
- **MCP Tools**: `/docs/dev-orchestrator.md`
