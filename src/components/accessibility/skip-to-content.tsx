/**
 * EcoHub Kosova – Skip to Content Component
 * MIT License – feel free to reuse in other projects.
 * Copyright (c) 2025 Kosovo Advocacy and Development Center (KADC)
 *
 * Accessibility component that allows keyboard users to skip
 * navigation and jump directly to main content.
 *
 * Note: This is a server component with static text to avoid
 * requiring NextIntlClientProvider context in the root layout.
 */

export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="
        sr-only
        focus:not-sr-only
        focus:fixed
        focus:top-4
        focus:left-4
        focus:z-[100]
        focus:px-4
        focus:py-2
        focus:bg-emerald-600
        focus:text-white
        focus:rounded-lg
        focus:shadow-lg
        focus:outline-none
        focus:ring-2
        focus:ring-emerald-400
        focus:ring-offset-2
        transition-all
      "
    >
      {/* Bilingual text for accessibility - shown to screen readers and on focus */}
      <span lang="sq">Kalo te përmbajtja</span>
      <span className="mx-1" aria-hidden="true">
        |
      </span>
      <span lang="en">Skip to content</span>
    </a>
  )
}
