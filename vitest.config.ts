import { defineConfig } from "vitest/config"
import path from "node:path"

const stub = path.resolve(__dirname, "./src/test/stubs/generic-stubs.tsx")

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      actions: stub,
      page: stub,
      layout: stub,
      loading: stub,
      "admin-quick-action-card": stub,
      "admin-stat-card": stub,
      "articles-client-page": stub,
      "listings-client-page": stub,
      "organization-members-client-page": stub,
      "organizations-client-page": stub,
      "profile-client-page": stub,
      "header-client": stub,
      "form-field": stub,
      "form-status": stub,
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    exclude: [
      "e2e/**",
      "node_modules/**",
      "tools/**",
      "playwright-report/**",
      "dist/**",
      ".next/**",
      "**/__tests__.skip/**",
      "**/marketplace-v2/__tests__/**",
      "**/eco-organizations/__tests__/**",
    ],
    pool: "threads",
    isolate: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "node_modules/",
        "src/test/",
        "**/*.test.ts",
        "**/*.test.tsx",
        "dist/",
        ".next/",
        "playwright.config.ts",
        "vitest.config.ts",
      ],
      thresholds: {
        lines: 50,
        functions: 40,
        branches: 40,
        statements: 50,
      },
    },
  },
})
