# Contributing to EcoHub Kosova

Thank you for your interest in contributing to EcoHub Kosova! This guide will help you get started.

## 📋 Table of Contents

- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Code Standards](#code-standards)
- [Git Workflow](#git-workflow)
- [Internationalization (i18n)](#internationalization-i18n)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)

---

## Development Setup

### Prerequisites

- Node.js 20+
- pnpm 10+
- Supabase account (for database)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/your-org/ecohubkosova.git
cd ecohubkosova

# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env.local

# Configure your Supabase credentials in .env.local
# NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Start development server
pnpm dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### Environment Variables

| Variable                        | Required | Description                           |
| ------------------------------- | -------- | ------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Yes      | Supabase project URL                  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes      | Supabase anonymous key                |
| `NEXT_PUBLIC_SITE_URL`          | Yes      | Production site URL (for email links) |
| `SENTRY_DSN`                    | No       | Sentry error tracking DSN             |
| `SENTRY_ORG`                    | No       | Sentry organization slug              |
| `SENTRY_PROJECT`                | No       | Sentry project name                   |

---

## Project Structure

```
ecohubkosova/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── [locale]/           # Locale-prefixed routes
│   │   │   ├── (auth)/         # Authentication pages
│   │   │   ├── (protected)/    # Authenticated user pages
│   │   │   └── (site)/         # Public site pages
│   │   └── api/                # API routes
│   ├── components/             # Reusable components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── seo/                # SEO components (JSON-LD)
│   │   ├── accessibility/      # Accessibility components
│   │   └── layout/             # Layout components
│   ├── lib/                    # Utility libraries
│   │   ├── supabase/           # Supabase client
│   │   └── auth/               # Auth utilities
│   └── services/               # Data fetching services
├── messages/                   # Translation files
│   ├── en/                     # English translations
│   └── sq/                     # Albanian translations
├── public/                     # Static assets
├── e2e/                        # End-to-end tests (Playwright)
└── docs/                       # Documentation
```

---

## Code Standards

### TypeScript

- Use TypeScript strict mode
- Define explicit types for function parameters and return values
- Use interfaces over types for object shapes
- Avoid `any` - use `unknown` if type is truly unknown

### Formatting

```bash
# Format code
pnpm format

# Check formatting
pnpm format:check
```

### Linting

```bash
# Run linter
pnpm lint

# Run ESLint directly
pnpm lint:eslint
```

### Type Checking

```bash
# Check types
pnpm tsc --noEmit
```

### Component Guidelines

1. **File naming**: Use PascalCase for components (`MyComponent.tsx`)
2. **Exports**: Prefer named exports over default exports
3. **Props**: Define props interface above component
4. **Server vs Client**: Mark client components with `"use client"`

```tsx
// ✅ Good
interface ButtonProps {
  variant: "primary" | "secondary"
  children: React.ReactNode
}

export function Button({ variant, children }: ButtonProps) {
  return <button className={styles[variant]}>{children}</button>
}

// ❌ Avoid
export default function Button(props: any) {
  return <button>{props.children}</button>
}
```

---

## Git Workflow

### Branch Naming

```
feature/short-description
fix/issue-description
chore/task-description
docs/documentation-update
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add password reset functionality
fix: resolve login redirect issue
chore: update dependencies
docs: add contributing guide
style: format code with prettier
refactor: extract auth utilities
test: add login flow tests
```

### Protected Branches

- `main` - Production branch, requires PR review
- `develop` - Development branch (if used)

---

## Internationalization (i18n)

All user-facing text must be translated. We support:

- **Albanian (sq)** - Primary language
- **English (en)** - Secondary language

### Adding Translations

1. Add English key to `messages/en/<namespace>.json`
2. Add Albanian translation to `messages/sq/<namespace>.json`
3. Use the translation in your component:

```tsx
import { useTranslations } from "next-intl"

export function MyComponent() {
  const t = useTranslations("namespace")
  return <h1>{t("keyName")}</h1>
}
```

### Server Components

```tsx
import { getTranslations } from "next-intl/server"

export default async function Page() {
  const t = await getTranslations("namespace")
  return <h1>{t("keyName")}</h1>
}
```

### Namespaces

Each feature has its own namespace:

- `common` - Shared strings (buttons, labels)
- `auth` - Authentication pages
- `marketplace` / `marketplace-v2` - Marketplace features
- `dashboard` / `DashboardV2` - Dashboard pages
- `admin` - Admin panel

---

## Testing

### Unit Tests (Vitest)

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### End-to-End Tests (Playwright)

```bash
# Run E2E tests
pnpm test:e2e

# Run smoke tests only
pnpm test:e2e:smoke

# Run with UI
pnpm test:e2e --headed
```

### Writing Tests

- Place unit tests next to the file: `MyComponent.test.tsx`
- Place E2E tests in `e2e/` directory
- Use meaningful test descriptions
- Test both success and error cases

---

## Pull Request Process

### Before Submitting

1. ✅ Code compiles: `pnpm tsc --noEmit`
2. ✅ Linter passes: `pnpm lint`
3. ✅ Tests pass: `pnpm test`
4. ✅ Build succeeds: `pnpm build`
5. ✅ Translations added for both locales

### PR Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

How was this tested?

## Screenshots (if applicable)

Add screenshots for UI changes

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Translations added (if applicable)
- [ ] Tests added (if applicable)
- [ ] Documentation updated (if applicable)
```

### Review Process

1. Create PR from your feature branch to `main`
2. Fill out PR template
3. Wait for CI checks to pass
4. Request review from CODEOWNERS
5. Address review feedback
6. Merge after approval

---

## Need Help?

- 📖 Check the [`docs/`](./docs) folder for detailed documentation
- 🐛 [Open an issue](https://github.com/your-org/ecohubkosova/issues) for bugs
- 💬 Join our community chat (if applicable)

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Thank you for contributing! 🌱
