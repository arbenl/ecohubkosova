const js = require("@eslint/js")
const nextPlugin = require("@next/eslint-plugin-next")
const typescriptPlugin = require("@typescript-eslint/eslint-plugin")
const typescriptParser = require("@typescript-eslint/parser")
const importPlugin = require("eslint-plugin-import")

module.exports = [
  {
    ignores: [".next/**", "node_modules/**", "dist/**", "eslint.config.js"],
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        React: "readonly",
        JSX: "readonly",
        URL: "readonly",
        process: "readonly",
        console: "readonly",
        module: "readonly",
        require: "readonly",
        Buffer: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        window: "readonly",
        document: "readonly",
        fetch: "readonly",
        URLSearchParams: "readonly",
        HTMLInputElement: "readonly",
        HTMLTextAreaElement: "readonly",
        HTMLDivElement: "readonly",
        HTMLButtonElement: "readonly",
        HTMLUListElement: "readonly",
        HTMLLIElement: "readonly",
        HTMLAnchorElement: "readonly",
        HTMLTableElement: "readonly",
        HTMLTableSectionElement: "readonly",
        HTMLTableRowElement: "readonly",
        HTMLTableCellElement: "readonly",
        HTMLTableCaptionElement: "readonly",
        HTMLSpanElement: "readonly",
        KeyboardEvent: "readonly",
        FormData: "readonly",
        AbortController: "readonly",
        alert: "readonly",
        __dirname: "readonly",
        global: "readonly",
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
        NodeJS: "readonly",
      },
    },
    plugins: {
      "@next/next": nextPlugin,
      "@typescript-eslint": typescriptPlugin,
      import: importPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      "no-unused-vars": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "import/no-restricted-paths": [
        "error",
        {
          zones: [
            {
              target: "./src/app/**",
              from: "./src/services/**",
              message:
                "Direct service imports are not allowed inside app components. Use a server action instead.",
            },
            {
              target: "./src/app/**",
              from: "./src/db/**",
              message: "App components should not import from the database layer directly.",
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      "src/app/(auth)/success/page.tsx",
      "src/app/(public)/faq/page.tsx",
      "src/app/(public)/about/coalition/page.tsx",
      "src/app/(public)/contact/page.tsx",
      "src/app/(public)/legal/terms/page.tsx",
      "src/app/(public)/help/page.tsx",
    ],
    rules: {
      "react/no-unescaped-entities": "off",
    },
  },
]
