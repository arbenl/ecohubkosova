# V1 Cleanup - Git Commit Checklist

## Files to Stage and Commit

### 🗑️ Deleted Files (V1 Removal)

```bash
git add -u src/app/api/v1/
git add -u messages/en/explore.json
git add -u messages/sq/explore.json
git add -u src/app/[locale]/(site)/explore/__tests__.skip/
git add -u src/app/[locale]/(site)/explore/cta.tsx
git add -u src/app/[locale]/(site)/explore/cta.test.tsx
git add -u src/app/[locale]/(site)/explore/loading.tsx
git add -u src/app/[locale]/(site)/explore/loading.test.tsx
git add -u src/app/[locale]/(site)/explore/page.test.tsx
```

### ✏️ Modified Files (V1 to V2 Migration)

```bash
# Core i18n and locale handling
git add src/lib/i18n.ts
git add src/types/global.d.ts
git add src/app/[locale]/layout.tsx

# Navigation fixes
git add src/components/header-client.tsx
git add src/app/[locale]/(site)/explore/page.tsx

# Router import fixes
git add src/app/[locale]/(site)/marketplace/[id]/contact-listing-button.tsx
git add src/components/admin/admin-stat-card.tsx

# Admin fixes
git add src/app/[locale]/(protected)/admin/articles/actions.ts

# Package config
git add package.json
```

### 📝 New Files (Regression Prevention & Documentation)

```bash
# Regression prevention
git add scripts/regression-guards.sh
git add e2e/smoke-navigation.spec.ts

# Documentation
git add docs/v1-cleanup-report.md
git add docs/footer-locale-fix.md
git add docs/v1-cleanup-final-summary.md
```

## Commit Message

```
feat: Complete V1 cleanup and implement regression prevention

BREAKING CHANGES:
- Removed /api/v1 endpoints (unused)
- Removed /explore route (now redirects to /marketplace)
- Removed explore i18n namespace

Features:
- Add regression guards script to prevent manual locale prefixing
- Add smoke navigation tests for locale persistence
- Fix footer locale handling for Next.js 15 (requestLocale pattern)

Fixes:
- Fix router imports in contact-listing-button and admin-stat-card
- Fix null check in admin articles actions
- Remove all V1 UI references and components

Documentation:
- Add comprehensive V1 cleanup documentation
- Add footer locale fix documentation
- Add final summary with verification steps

All routes now use V2 exclusively with proper locale-aware navigation.
Build and type-check passing.
```

## Verification Before Commit

### 1. Run All Checks

```bash
# Regression guards
npm run check:regression

# Type safety
pnpm tsc --noEmit

# Build
pnpm build

# Lint
pnpm lint
```

### 2. Expected Results

- ✅ All checks should pass
- ✅ No TypeScript errors
- ✅ Build completes successfully
- ✅ No regression violations

### 3. Manual Testing

```bash
# Start dev server
npm run dev

# Test in browser:
# 1. Visit http://localhost:3000/en/home
#    - Footer should be in English
#    - All navigation should stay on /en/*

# 2. Visit http://localhost:3000/sq/home
#    - Footer should be in Albanian
#    - All navigation should stay on /sq/*

# 3. Visit http://localhost:3000/en/explore
#    - Should redirect to /en/marketplace
```

## Files to Ignore (Not Part of V1 Cleanup)

These are from other work and should be committed separately:

- `messages/en/DashboardV2.json` (already staged)
- `messages/sq/DashboardV2.json` (already staged)
- Other unrelated changes in my/organization, dashboard, etc.

## Quick Commit Commands

```bash
# Stage V1 cleanup files only
git add -u src/app/api/v1/
git add -u messages/*/explore.json
git add -u src/app/[locale]/(site)/explore/
git add src/lib/i18n.ts
git add src/types/global.d.ts
git add src/components/header-client.tsx
git add src/app/[locale]/(site)/marketplace/[id]/contact-listing-button.tsx
git add src/components/admin/admin-stat-card.tsx
git add src/app/[locale]/(protected)/admin/articles/actions.ts
git add package.json
git add scripts/regression-guards.sh
git add e2e/smoke-navigation.spec.ts
git add docs/v1-cleanup-*.md
git add docs/footer-locale-fix.md

# Review staged changes
git status
git diff --staged

# Commit
git commit -m "feat: Complete V1 cleanup and implement regression prevention

BREAKING CHANGES:
- Removed /api/v1 endpoints (unused)
- Removed /explore route (now redirects to /marketplace)
- Removed explore i18n namespace

Features:
- Add regression guards script to prevent manual locale prefixing
- Add smoke navigation tests for locale persistence
- Fix footer locale handling for Next.js 15 (requestLocale pattern)

Fixes:
- Fix router imports in contact-listing-button and admin-stat-card
- Fix null check in admin articles actions
- Remove all V1 UI references and components

Documentation:
- Add comprehensive V1 cleanup documentation
- Add footer locale fix documentation
- Add final summary with verification steps

All routes now use V2 exclusively with proper locale-aware navigation.
Build and type-check passing."
```

## Post-Commit

1. Push to remote:

   ```bash
   git push origin feat/v2-user-dashboard
   ```

2. Create PR with reference to:
   - `docs/v1-cleanup-final-summary.md`
   - Verification steps completed
   - Build passing evidence

3. Mark related issues as resolved
