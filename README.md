# EcoHub Kosova

EcoHub Kosova is a Next.js App Router project that powers a circular-economy portal for listings, organizations, knowledge-base articles, and administrative workflows. The app is built with PNPM, TypeScript, Tailwind CSS + shadcn/ui, and Supabase for auth/data.

## Tech Stack

- **Framework:** Next.js 14 (App Router, TypeScript, Server Components)
- **UI:** Tailwind CSS, shadcn/ui, lucide-react icons
- **Data/Auth:** Supabase client + auth helpers
- **Tooling:** PNPM, ESLint (`next/core-web-vitals`), TypeScript strict mode

## Getting Started

1. Install PNPM if you don't already have it: `corepack enable`
2. Install dependencies:

```bash
pnpm install
```

3. Copy `.env.example` to `.env.local` (or create it) and fill in the Supabase keys and any other secrets the app expects.
4. Start the dev server:

```bash
pnpm dev
```

The app runs on [http://localhost:3000](http://localhost:3000).

## Available Scripts

| Command        | Description                                  |
| -------------- | -------------------------------------------- |
| `pnpm dev`     | Start the Next.js development server         |
| `pnpm lint`    | Run ESLint with the Next.js config           |
| `pnpm test`    | Placeholder hook (replace with real tests)   |
| `pnpm build`   | Create a production build (lint+type checks) |
| `pnpm start`   | Start the production server (`pnpm build` first) |

> **Note:** `pnpm build` currently requires network access to download Google Fonts (Inter) the first time it runs.

## Project Structure Highlights

- `app/` – App Router routes for pages (home, auth, admin, marketplace, etc.).
- `components/` – Shared UI components (header/footer, listings, shadcn/ui exports).
- `lib/` – Supabase client, auth provider, utilities.
- `docs/roadmap.md` – High-level roadmap of upcoming initiatives.
- `docs/next-session-specs.md` – The short-term TODO list for the next coding session.

## Contributing Workflow

1. Create a feature branch from `main`.
2. Make your changes with `pnpm dev`.
3. Run `pnpm lint`, `pnpm test`, and `pnpm build`.
4. Commit using conventional-ish messages (e.g., `feat: ...`, `fix: ...`, `chore: ...`).
5. Open a PR against `main`.

## Roadmap / Next Steps

See `docs/roadmap.md` and `docs/next-session-specs.md` for the current plan. Highlights include:

- Moving Supabase CRUD into server actions/route handlers to secure API access.
- Adding automated tests (Vitest/Playwright) and CI workflows.
- Planning the eventual move back to React 19 / Next 15 once upstream libraries support it.

## License

This repository currently doesn’t declare a license. If you plan to open source it, add one under the root (e.g., `LICENSE`).

