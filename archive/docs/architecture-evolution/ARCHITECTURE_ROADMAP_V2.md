# Architecture Roadmap v2.0

This document provides a new, prioritized roadmap for improving the EcoHub Kosova application. It follows a deep investigation that confirmed several outstanding issues and uncovered new, critical areas for improvement.

The recent refactoring of the registration page is an excellent step forward and serves as a strong example of the architectural patterns that should be adopted throughout the application.

---

### Prioritized Recommendations

The following recommendations are prioritized to address the most critical issues first.

#### P0: Critical Issues (Address Immediately)

These issues represent significant risks to the application's security, stability, and maintainability.

**1. Remove Duplicated Public Routes**

- **Problem:** The directory `src/app/\(public\)` contains duplicates of routes that already exist in `src/app/(public)` (e.g., `about`, `home`, `marketplace`). This is a severe issue that causes code duplication, doubles maintenance effort, and can lead to inconsistent behavior.
- **Recommendation:**
  1.  Carefully compare the contents of `src/app/\(public\)` and `src/app/(public)`.
  2.  Ensure the versions in `src/app/(public)` are the correct, up-to-date ones.
  3.  **Delete the entire `src/app/\(public\)` directory.**

**2. Implement Security Headers**

- **Problem:** The `next.config.mjs` file is missing essential security headers, leaving the application vulnerable to common attacks like Cross-Site Scripting (XSS), clickjacking, and protocol downgrade attacks.
- **Recommendation:** Add a `headers` block to `next.config.mjs` to implement a strict Content Security Policy (CSP) and other security headers. A good starting point is to use the headers recommended by the Vercel documentation or a security-focused library.

---

#### P1: Code Quality & Automation

These issues weaken the project's long-term health and make it harder to maintain a high standard of quality.

**1. Fix the Pre-commit Hook**

- **Problem:** The `lint-staged` configuration in `package.json` is incomplete. It only formats code with Prettier but does not run ESLint. This allows code with quality issues or rule violations to be committed.
- **Recommendation:** Update the `lint-staged` configuration in `package.json` to also run `eslint --fix`.

**2. Re-enable Architectural Linting**

- **Problem:** The `import/no-restricted-paths` rule in `.eslintrc.js` is disabled (commented out). This rule is crucial for enforcing architectural boundaries (e.g., preventing client components from importing server-side code).
- **Recommendation:** Re-enable the rule and configure it to protect your architectural layers. For example, prevent `app` components from importing directly from `services` or `db`.

---

#### P2: Future Improvements & Refactoring

Once the critical issues are resolved, focus can shift to these areas.

**1. Conduct a Data Layer Review**

- **Next Step:** Perform a review of the data access patterns in the `src/services` directory. Look for potential performance issues like N+1 queries, which can occur if you fetch a list of items and then make a separate query for each item in a loop. Ensure all data access is efficient and consistent.

**2. Identify Candidates for Refactoring**

- **Next Step:** Apply the same successful refactoring pattern from the registration page to other complex parts of the application. Good candidates are likely in the user dashboard, profile management, or listing creation flows. Look for large components with complex state.

**3. Utilize `vercel.json`**

- **Next Step:** The `vercel.json` file is currently empty. This file can be used to define environment-specific settings, advanced redirects, or other platform-level configurations that you don't want to commit to your main `next.config.mjs`.
