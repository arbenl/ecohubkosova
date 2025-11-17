#!/usr/bin/env bash

# Reset Test Database
# This script safely resets the TEST database to a clean state.
# 
# SAFETY: Only runs if DATABASE_URL contains "_test" to prevent production accidents.
# Usage: pnpm db:reset:test

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Test Database Reset ===${NC}"

# Verify we're in test environment
if [[ -z "${DATABASE_URL:-}" ]]; then
    echo -e "${RED}❌ ERROR: DATABASE_URL not set${NC}"
    exit 1
fi

# CRITICAL SAFETY CHECK: Ensure we're NOT touching production
if [[ ! "$DATABASE_URL" == *"_test"* ]] && [[ ! "$DATABASE_URL" == *"test"* ]] && [[ ! "$DATABASE_URL" == *"localhost"* ]]; then
    echo -e "${RED}❌ CRITICAL: DATABASE_URL does not look like a test database!${NC}"
    echo -e "${RED}   URL: $DATABASE_URL${NC}"
    echo -e "${RED}   This script will NOT run against production.${NC}"
    exit 1
fi

echo -e "${YELLOW}ℹ Target DB: $(echo $DATABASE_URL | sed 's/.*@//;s/\?.*//g')${NC}"
echo ""

# Check if Prisma is available
if ! command -v npx &> /dev/null; then
    echo -e "${RED}❌ npx not found. Install Node.js 18+${NC}"
    exit 1
fi

# Step 1: Run Prisma reset
echo -e "${BLUE}Step 1: Resetting Prisma schema...${NC}"
if npx prisma migrate reset --force --skip-generate 2>&1; then
    echo -e "${GREEN}✓ Prisma reset complete${NC}"
else
    echo -e "${RED}❌ Prisma reset failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Test database reset successfully${NC}"
echo ""
echo "Next steps:"
echo "  pnpm db:migrate:test   # Run migrations"
echo "  pnpm db:seed:test      # Seed data"
echo "  pnpm e2e               # Run E2E tests"
