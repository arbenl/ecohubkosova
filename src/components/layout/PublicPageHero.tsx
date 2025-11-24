"use client"

import { useTranslations } from "next-intl"
import clsx from "clsx"

interface PublicPageHeroProps {
  namespace: string
  titleKey: string
  subtitleKey: string
  eyebrowKey?: string
  actions?: React.ReactNode
  children?: React.ReactNode
  variant?: "default" | "campaign" | "centered" | "mint"
}

/**
 * PublicPageHero: Canonical hero component for all public-facing pages
 * 
 * Variants:
 * - "campaign" (default): Strong emerald gradient, used for Partners (recruitment focus)
 * - "default": Emerald gradient with white text, used for How-It-Works (explainer)
 * - "mint": Soft emerald-50 → emerald-100 gradient, used for Eco-organizations (directory)
 * - "centered": Centered text layout on mint gradient, used for About (narrative)
 * 
 * All text sourced from i18n namespaces (no hardcoded strings).
 */
export function PublicPageHero({
  namespace,
  titleKey,
  subtitleKey,
  eyebrowKey,
  actions,
  children,
  variant = "campaign",
}: PublicPageHeroProps) {
  const t = useTranslations(namespace)

  // Centered layout with mint background (About-Us style)
  if (variant === "centered") {
    return (
      <div className="py-12 md:py-16 lg:py-20 relative overflow-hidden bg-gradient-to-br from-emerald-50 to-emerald-100">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            {eyebrowKey && (
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 mb-3 md:mb-4">
                {t(eyebrowKey)}
              </p>
            )}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 md:mb-6 text-slate-900">
              {t(titleKey)}
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-gray-700 max-w-3xl mx-auto mb-6 md:mb-8 leading-relaxed">
              {t(subtitleKey)}
            </p>
            {actions && <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-stretch sm:items-center">{actions}</div>}
          </div>
        </div>
      </div>
    )
  }

  // Mint variant: Pale background for directory/utility (Eco-organizations style)
  if (variant === "mint") {
    return (
      <section className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-b border-emerald-200">
        <div className={clsx(
          "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 md:py-12 lg:py-14",
          children ? "flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between" : ""
        )}>
          <div className="space-y-3 md:space-y-4">
            {eyebrowKey && (
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                {t(eyebrowKey)}
              </p>
            )}
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">{t(titleKey)}</h1>
            <p className="max-w-2xl text-base md:text-lg text-slate-700">{t(subtitleKey)}</p>
            {actions && <div className="flex flex-col sm:flex-row flex-wrap gap-3">{actions}</div>}
          </div>
          {children}
        </div>
      </section>
    )
  }

  // Campaign variant: Strong emerald gradient (Partners hero recruitment focus)
  if (variant === "campaign") {
    return (
      <section className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white">
        <div className={clsx(
          "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 md:py-12 lg:py-14",
          children ? "flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between" : ""
        )}>
          <div className="space-y-3 md:space-y-4">
            {eyebrowKey && (
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">
                {t(eyebrowKey)}
              </p>
            )}
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">{t(titleKey)}</h1>
            <p className="max-w-2xl text-base md:text-lg text-emerald-50">{t(subtitleKey)}</p>
            {actions && <div className="flex flex-col sm:flex-row flex-wrap gap-3">{actions}</div>}
          </div>
          {children}
        </div>
      </section>
    )
  }

  // Default variant: Emerald gradient (How-It-Works style)
  return (
    <section className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white">
      <div className={clsx(
        "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 md:py-12 lg:py-14",
        children ? "flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between" : ""
      )}>
        <div className="space-y-3 md:space-y-4">
          {eyebrowKey && (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">
              {t(eyebrowKey)}
            </p>
          )}
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">{t(titleKey)}</h1>
          <p className="max-w-2xl text-base md:text-lg text-emerald-50">{t(subtitleKey)}</p>
          {actions && <div className="flex flex-col sm:flex-row flex-wrap gap-3">{actions}</div>}
        </div>
        {children}
      </div>
    </section>
  )
}
