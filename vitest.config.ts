import { defineConfig } from "vitest/config"
import path from "node:path"

function aliasPlugin() {
  return {
    name: "custom-alias",
    resolveId(source: string) {
      if (source.startsWith("@/")) {
        return path.resolve(__dirname, "src", source.slice(2))
      }
      return null
    },
  }
}

export default defineConfig({
  plugins: [aliasPlugin()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    exclude: ["e2e/**", "node_modules/**", "tools/**", "playwright-report/**", "dist/**", ".next/**", "**/__tests__.skip/**"],
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
