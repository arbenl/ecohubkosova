#!/bin/bash

# E2E Auth Testing Quick Start Script
# This script helps you set up and run E2E tests for ecohubkosova

set -e

echo "========================================"
echo "ecohubkosova E2E Auth Testing Setup"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node --version)${NC}"

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}⚠ pnpm not found. Installing pnpm...${NC}"
    npm install -g pnpm
fi

echo -e "${GREEN}✓ pnpm $(pnpm --version)${NC}"
echo ""

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    pnpm install
fi

# Check if Playwright browsers are installed
echo -e "${BLUE}ℹ Checking Playwright browsers...${NC}"
if ! pnpm exec playwright install --with-deps > /dev/null 2>&1; then
    echo -e "${YELLOW}Installing Playwright browsers...${NC}"
    pnpm exec playwright install --with-deps
fi
echo -e "${GREEN}✓ Playwright browsers installed${NC}"
echo ""

# Prompt for test credentials
echo -e "${BLUE}ℹ E2E tests require valid test user credentials${NC}"
echo ""

# Use environment variables if set, otherwise prompt
if [ -z "$TEST_USER_EMAIL" ]; then
    read -p "Enter test user email (default: test-user@example.com): " TEST_USER_EMAIL
    TEST_USER_EMAIL=${TEST_USER_EMAIL:-test-user@example.com}
fi

if [ -z "$TEST_USER_PASSWORD" ]; then
    read -sp "Enter test user password (default: TestPassword123!): " TEST_USER_PASSWORD
    TEST_USER_PASSWORD=${TEST_USER_PASSWORD:-TestPassword123!}
    echo ""
fi

export TEST_USER_EMAIL
export TEST_USER_PASSWORD

echo -e "${GREEN}✓ Test credentials configured${NC}"
echo "  Email: $TEST_USER_EMAIL"
echo "  Password: [hidden]"
echo ""

# Show test options
echo -e "${BLUE}ℹ Choose test mode:${NC}"
echo ""
echo "  1) Run all E2E auth tests (default)"
echo "  2) Run specific test (with UI)"
echo "  3) Run tests in headed mode (see browser)"
echo "  4) Run tests in debug mode (interactive debugging)"
echo "  5) Run tests and show report"
echo "  6) Run a single test by name"
echo ""

read -p "Enter option (1-6, press Enter for 1): " choice
choice=${choice:-1}

case $choice in
    1)
        echo -e "${BLUE}🧪 Running all E2E auth tests...${NC}"
        pnpm exec playwright test e2e/auth.e2e.spec.ts
        echo ""
        echo -e "${GREEN}✓ Tests complete!${NC}"
        echo ""
        echo "📊 View HTML report:"
        echo "  pnpm exec playwright show-report"
        ;;
    2)
        echo -e "${BLUE}ℹ Available tests:${NC}"
        echo "  TC-001 - Login with valid credentials"
        echo "  TC-002 - Login with invalid credentials"
        echo "  TC-003 - Access dashboard after login"
        echo "  TC-004 - Deny unauthenticated dashboard access"
        echo "  TC-005 - Logout and redirect"
        echo "  TC-006 - Deny dashboard access after logout"
        echo "  TC-007 - Complete user journey (full flow)"
        echo "  TC-008 - Handle empty form submission"
        echo "  TC-009 - Maintain session across pages"
        echo "  TC-010 - Handle slow network timeout"
        echo "  TC-011 - Performance: login time"
        echo ""
        read -p "Enter test ID (e.g., TC-001): " test_id
        echo -e "${BLUE}🧪 Running test $test_id...${NC}"
        pnpm exec playwright test e2e/auth.e2e.spec.ts -g "$test_id"
        ;;
    3)
        echo -e "${BLUE}🧪 Running tests in headed mode (browser visible)...${NC}"
        pnpm exec playwright test e2e/auth.e2e.spec.ts --headed
        ;;
    4)
        echo -e "${BLUE}🧪 Running tests in debug mode (interactive)...${NC}"
        pnpm exec playwright test e2e/auth.e2e.spec.ts --debug
        ;;
    5)
        echo -e "${BLUE}🧪 Running tests and generating report...${NC}"
        pnpm exec playwright test e2e/auth.e2e.spec.ts
        echo ""
        echo -e "${GREEN}✓ Tests complete! Opening HTML report...${NC}"
        pnpm exec playwright show-report
        ;;
    6)
        read -p "Enter test name (exact match, e.g., 'Should successfully logout'): " test_name
        echo -e "${BLUE}🧪 Running test: $test_name${NC}"
        pnpm exec playwright test e2e/auth.e2e.spec.ts -g "$test_name"
        ;;
    *)
        echo -e "${YELLOW}Invalid option. Running default (all tests)...${NC}"
        pnpm exec playwright test e2e/auth.e2e.spec.ts
        ;;
esac

echo ""
echo "========================================"
echo "Test run complete!"
echo "========================================"
echo ""
echo -e "${BLUE}ℹ Troubleshooting:${NC}"
echo "  • View full guide: E2E_AUTH_TESTING_GUIDE.md"
echo "  • Check screenshots: test-results/"
echo "  • View traces: playwright-report/"
echo ""
echo -e "${BLUE}ℹ Next steps:${NC}"
echo "  • Debug failed tests: pnpm exec playwright test e2e/auth.e2e.spec.ts --debug"
echo "  • View report: pnpm exec playwright show-report"
echo "  • Check browser logs: pnpm exec playwright test e2e/auth.e2e.spec.ts --headed"
echo ""
