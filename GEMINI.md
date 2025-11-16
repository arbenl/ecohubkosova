# Project: EcoHub Kosova

## Project Overview

This is a Next.js 16.0.3 (App Router) project for a circular-economy portal called "EcoHub Kosova". The application is built with PNPM, TypeScript, Tailwind CSS, and shadcn/ui. It uses Supabase for authentication and data storage. The primary language of the application is Albanian.

The main features of the application include:

- User and organization profiles
- Listings for a circular economy marketplace
- Knowledge-base articles
- Administrative workflows

## Building and Running

The project uses `pnpm` as the package manager.

**Key commands:**

- **Install dependencies:**
  ```bash
  pnpm install
  ```
- **Run the development server:**

  ```bash
  pnpm dev
  ```

  The application will be available at [http://localhost:3000](http://localhost:3000).

- **Lint the code:**
  ```bash
  pnpm lint
  ```
- **Build for production:**
  ```bash
  pnpm build
  ```
- **Run the production server:**
  ```bash
  pnpm start
  ```

**Environment Variables:**

The application requires Supabase credentials to be set up in a `.env.local` file. You can copy the `.env.example` file (if it exists) to create it. The following variables are needed:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Development Conventions

- **Package Manager:** `pnpm` is used for dependency management.
- **Styling:** Tailwind CSS with `shadcn/ui` components.
- **Code Style:** ESLint with `next/core-web-vitals` is used for linting.
- **Type Checking:** The project is written in TypeScript with strict mode enabled.
- **Commits:** The project follows a conventional-ish commit message format (e.g., `feat: ...`, `fix: ...`, `chore: ...`).
- **Branching:** The typical workflow is to create a feature branch from `main` and open a pull request against `main`.

## Project Structure

- `app/`: Contains the App Router routes for all pages, including public-facing pages, authentication, and admin sections.
- `components/`: Shared UI components, including the header, footer, and `shadcn/ui` components.
- `lib/`: Contains the Supabase client, authentication provider, and other utility functions.
- `docs/`: Contains project documentation, including a roadmap and specifications for the next coding session.
- `scripts/`: Contains SQL scripts for database setup.
