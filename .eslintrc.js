require("@rushstack/eslint-patch/modern-module-resolution")

module.exports = {
  extends: ["next/core-web-vitals"],
  rules: {
    "import/no-restricted-paths": [
      "error",
      {
        zones: [
          {
            target: "./src/app/**",
            from: "./src/services/**",
            message: "Direct service imports are not allowed inside app components. Use a server action instead.",
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
  overrides: [
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
  ],
}
