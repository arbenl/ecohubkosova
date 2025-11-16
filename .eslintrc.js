require("@rushstack/eslint-patch/modern-module-resolution")

module.exports = {
  extends: ["next/core-web-vitals"],
  rules: {
    // Import rules to prevent architectural violations
    "import/no-restricted-paths": "off", // Disabled until eslint config is migrated
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
