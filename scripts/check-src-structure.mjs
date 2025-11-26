#!/usr/bin/env node

import { readdirSync } from "node:fs"
import path from "node:path"

const rootDir = process.cwd()

const ALLOWED_TOP_LEVEL_DIRS = new Set([
  "src",
  "public",
  "docs",
  "supabase",
  "prisma",
  "scripts",
  "styles",
  "e2e",
  ".storybook",
  "tools",
  "archive",
])

const SKIP_DIRS = new Set(["node_modules", ".git", ".next", ".pnpm-store", "drizzle", "playwright-report", "test-results"])

const ALLOWED_FILES = new Set([
  ".eslintrc.cjs",
  "eslint.config.js",
  ".eslintrc.cjs",
  ".gitignore",
  "AGENTS.md",
  "GEMINI.md",
  "components.json",
  "drizzle.config.ts",
  "vitest.config.ts",
  "middleware.ts",
  "next-env.d.ts",
  "next.config.mjs",
  "package.json",
  "playwright.config.ts",
  "pnpm-lock.yaml",
  "postcss.config.mjs",
  "README.md",
  "tailwind.config.ts",
  "tsconfig.json",
  "tsconfig.tsbuildinfo",
  "vercel.json",
  ".env.example",
  "apply-migration.js",
  "apply-trigger-fix.js",
  "test-db-query.js",
  "fix-trigger-function.sql",
  "backup.sql",
  "check-vercel-config.sh",
  "openapi.json",
  "sentry.client.config.ts",
  "sentry.edge.config.ts",
  "sentry.server.config.ts",
])

const CODE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"])

const violations = []

function isAllowedFile(relativePath) {
  if (ALLOWED_FILES.has(relativePath)) {
    return true
  }

  const [topSegment] = relativePath.split(path.sep)
  return ALLOWED_TOP_LEVEL_DIRS.has(topSegment)
}

function walk(directory) {
  const entries = readdirSync(directory, { withFileTypes: true })

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name)
    const relativePath = path.relative(rootDir, absolutePath)
    const normalizedRelativePath = relativePath.split(path.sep).join("/")

    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) {
        continue
      }
      walk(absolutePath)
      continue
    }

    const ext = path.extname(entry.name)
    if (!CODE_EXTENSIONS.has(ext)) {
      continue
    }

    if (!isAllowedFile(normalizedRelativePath)) {
      violations.push(normalizedRelativePath)
    }
  }
}

walk(rootDir)

if (violations.length > 0) {
  console.error(
    [
      "❌ Source layout violation detected.",
      "All application code must live under src/** (or one of the explicitly whitelisted directories).",
      "Please move the following files:",
      "",
      ...violations.map((file) => `  • ${file}`),
      "",
    ].join("\n")
  )
  process.exit(1)
}

console.log("✓ Source layout check passed.")
