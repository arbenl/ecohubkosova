# MCP Servers Setup & Usage Guide

Complete guide for using the E2E Test Generator and QA Audit MCP servers in EcoHub Kosova.

## Overview

This project includes two MCP (Model Context Protocol) servers:

1. **e2e-test-generator** - Generate Playwright tests from user stories
2. **ecohub-qa** - Comprehensive QA audits with 11 diagnostic tools

## Setup

### Step 1: Install Dependencies

```bash
# From project root
cd tools/e2e-test-generator
pnpm install
pnpm build

cd ../ecohub-qa
pnpm install
pnpm build
```

### Step 2: Configure MCP

The servers are configured in `.vscode/mcp.json`. Paths should be absolute:

```json
{
  "mcpServers": {
    "e2e-test-generator": {
      "command": "node",
      "args": ["/absolute/path/to/tools/e2e-test-generator/dist/index.js"]
    },
    "ecohub-qa": {
      "command": "node",
      "args": ["/absolute/path/to/tools/ecohub-qa/dist/index.js"]
    }
  }
}
```

### Step 3: Restart Claude/MCP Client

After configuration changes, restart your MCP client (Claude Desktop, VS Code extension, etc.).

## E2E Test Generator Usage

### Example 1: Generate Login Test

**Prompt:**
```
Generate a Playwright test for:
Given I am on the login page
When I enter valid credentials
Then I should be redirected to the dashboard
```

**Result:** Complete test file with page object imports and proper structure.

### Example 2: Generate Test Suite

**Prompt:**
```
Create a marketplace test suite with these flows:
- browse_listings
- search_products  
- filter_by_category
- view_listing_details
- contact_seller
```

**Result:** Full test suite with beforeEach setup and individual tests.

### Example 3: Generate Page Object

**Prompt:**
```
Generate a page object for the profile settings page with selectors:
- profileName: "input[name='name']"
- emailInput: "input[type='email']"
- saveButton: "button:has-text('Save')"
- cancelLink: "a:has-text('Cancel')"
```

**Result:** Type-safe page object class ready to use.

## QA Audit Server Usage

### Single Tool Audits

#### Check Authentication Security
**Prompt:**
```
Run auth_audit on ecohubkosova and list the top 5 high-severity issues
```

**Use when:**
- After modifying auth code
- Before deploying auth changes
- Investigating login/session issues

#### Validate Build Quality
**Prompt:**
```
Run build_health and tell me if it's safe to deploy
```

**Use when:**
- Before pushing to production
- After major refactoring
- CI/CD pipeline checks

#### Scan Runtime Logs
**Prompt:**
```
Run runtime_log_scan and highlight likely causes of errors
```

**Use when:**
- Debugging production issues
- After deployment
- Regular monitoring

### Multi-Tool Comprehensive Audits

#### Pre-Deployment Check
**Prompt:**
```
Run build_health, dependency_audit, csp_audit, and supabase_health. 
Give me a deployment readiness report with any blockers highlighted.
```

**When:** Before every production deployment

#### Security Audit
**Prompt:**
```
Run auth_audit, csp_audit, and supabase_health.
List all critical and high severity security issues.
```

**When:** Security reviews, vulnerability assessments

#### Navigation & Routing Audit
**Prompt:**
```
Run navigation_audit and show me:
1. Any unprotected routes that should require auth
2. Routes with inconsistent protection patterns
3. Missing layouts
```

**When:** After adding new routes, refactoring navigation

#### User Experience Audit
**Prompt:**
```
Run accessibility_audit and i18n_audit together.
Focus on user-facing issues that would affect different locales and assistive technologies.
```

**When:** Before major releases, accessibility compliance reviews

#### Performance & Dependencies
**Prompt:**
```
Run performance_audit and dependency_audit.
Show me the biggest bundle size offenders and security vulnerabilities.
```

**When:** Performance optimization sprints, dependency updates

### Tool-Specific Use Cases

#### `auth_audit`
**Prompt:** "Run auth_audit and check for redirect loops in middleware"
**Detects:** Session issues, old API usage, inconsistent patterns

#### `navigation_audit`
**Prompt:** "Check navigation_audit for routes that bypass protection"
**Detects:** Unprotected admin routes, auth routes in protected groups

#### `build_health`  
**Prompt:** "Run build_health and show me all TypeScript errors"
**Runs:** lint, typecheck, build - captures all errors

#### `runtime_log_scan`
**Prompt:** "Scan runtime logs for CSP violations"
**Finds:** CSP errors, API failures, unhandled exceptions

#### `supabase_health`
**Prompt:** "Verify Supabase configuration is correct"
**Checks:** Env vars, connectivity, key format

#### `performance_audit`
**Prompt:** "Show me pages with bloated bundles"
**Analyzes:** Bundle sizes, heavy dependencies

#### `dependency_audit`
**Prompt:** "List outdated packages with CVEs"
**Reports:** Vulnerabilities, outdated packages, duplicates

#### `accessibility_audit`
**Prompt:** "Find images without alt text and unlabeled buttons"
**Scans:** A11y issues in components

#### `i18n_audit`
**Prompt:** "Check for hard-coded English strings that need translation"
**Finds:** Missing translations, hard-coded text

#### `csp_audit`
**Prompt:** "Analyze CSP and propose separate dev/prod configs"
**Examines:** CSP directives, unsafe rules, Next.js compatibility

#### `env_audit`
**Prompt:** "Check all required environment variables are configured"
**Verifies:** NODE_ENV, site URLs, Sentry config, etc. (without exposing secrets)

## Advanced Workflows

### Pre-Commit Hook Simulation
```
Run build_health and dependency_audit. Fail if any critical issues exist.
```

### Weekly Quality Report
```
Run all 11 QA tools and create a summary dashboard showing:
- Critical issues count
- High severity issues by category
- Trend compared to last week
```

### Production Incident Response
```
Run runtime_log_scan with logs from the last 2 hours.
Then run auth_audit and navigation_audit to check if any recent code changes 
could have caused the issues.
```

### New Feature Pre-Merge Checklist
```
For the marketplace refactor branch:
1. Run build_health - ensure no new lint/type errors
2. Run accessibility_audit on new components
3. Run i18n_audit to verify all new strings are translated
4. Run performance_audit to check bundle impact
```

## Tips & Best Practices

### For E2E Test Generator

1. **Use descriptive user stories**: Clear Given/When/Then makes better tests
2. **Generate page objects first**: Then use them in test generation
3. **Specify testType**: Ensures correct page object imports
4. **Review generated code**: Generated tests are starting points - customize as needed

### For QA Audits

1. **Run regularly**: Schedule weekly comprehensive audits
2. **Prioritize critical/high**: Fix these before medium/low
3. **Track trends**: Compare audit results over time
4. **Automate pre-deploy**: Make build_health + dependency_audit required
5. **Context matters**: Some warnings are expected (e.g., dev CSP)

### Integration with Workflow

1. **Local development**: Run specific audits as you work
2. **Pull requests**: Run relevant audits before PR creation
3. **CI/CD**: Integrate build_health into pipeline
4. **Production monitoring**: Schedule runtime_log_scan
5. **Security reviews**: Run auth + csp + supabase monthly

## Troubleshooting

### MCP Server Not Found
- Check `.vscode/mcp.json` paths are absolute
- Verify `pnpm build` completed successfully
- Restart MCP client

### Tool Execution Errors
- Ensure you're in project root when running audits
- Check permissions on log directories
- Verify Next.js build exists for performance_audit

### Unexpected Results
- Some tools require prior setup (e.g., logs/, .next/)
- Dev vs prod environment affects results
- Check tool-specific README for prerequisites

## Maintenance

### Updating Servers

```bash
# Rebuild after code changes
cd tools/e2e-test-generator && pnpm build
cd tools/ecohub-qa && pnpm build
```

### Adding New QA Tools

1. Create tool in `tools/ecohub-qa/src/tools/`
2. Export from `index.ts`
3. Add to tools array
4. Rebuild and test

### Customizing Audits

Edit tool files in `tools/ecohub-qa/src/tools/` to adjust:
- Severity thresholds
- Patterns to detect
- Output formatting
- File scanning limits

## Support

For issues or questions:
1. Check individual tool READMEs
2. Review this guide
3. Examine tool source code for specifics
