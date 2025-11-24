"use client"

import Link from "next/link"
import { useLocale, useTranslations } from "next-intl"
import { Facebook, Instagram, Linkedin } from "lucide-react"

export function FooterV2() {
  const localeFromHook = useLocale()
  const locale = localeFromHook || "sq" // Fallback to Albanian if locale is undefined
  const t = useTranslations("footer")
  const year = new Date().getFullYear()

  const aboutLinks = [{ key: "linkHowItWorks", href: "how-it-works" }]
  const exploreLinks = [
    { key: "linkMarketplace", href: "marketplace" },
    { key: "linkPartners", href: "partners" },
    { key: "linkEcoOrganizations", href: "partners" },
  ]
  const helpLinks = [
    { key: "linkFAQ", href: "faq" },
    { key: "linkContact", href: "contact" },
    { key: "linkSupport", href: "help" },
  ]

  const socials = [
    { key: "socialFacebook", icon: Facebook },
    { key: "socialInstagram", icon: Instagram },
    { key: "socialLinkedIn", icon: Linkedin },
  ]

  return (
    <footer className="mt-16 border-t bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[2fr_3fr]">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-xl font-bold text-white shadow-lg">
                E
              </div>
              <div className="space-y-1">
                <p className="text-lg font-semibold text-slate-900">EcoHub Kosova</p>
                <p className="text-xs uppercase tracking-wide text-emerald-700">Circular marketplace</p>
              </div>
            </div>
            <p className="max-w-2xl text-sm leading-relaxed text-slate-700">{t("tagline")}</p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900">{t("columnAboutTitle")}</h3>
              <ul className="space-y-2 text-sm text-slate-700">
                {aboutLinks.map((link) => (
                  <li key={link.key}>
                    <Link
                      href={`/${locale}/${link.href}`}
                      className="transition hover:text-emerald-700"
                    >
                      {t(link.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900">{t("columnExploreTitle")}</h3>
              <ul className="space-y-2 text-sm text-slate-700">
                {exploreLinks.map((link) => (
                  <li key={link.key}>
                    <Link
                      href={`/${locale}/${link.href}`}
                      className="transition hover:text-emerald-700"
                    >
                      {t(link.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900">{t("columnHelpTitle")}</h3>
              <ul className="space-y-2 text-sm text-slate-700">
                {helpLinks.map((link) => (
                  <li key={link.key}>
                    <Link
                      href={`/${locale}/${link.href}`}
                      className="transition hover:text-emerald-700"
                    >
                      {t(link.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t bg-slate-100">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-4 text-xs text-slate-600 sm:flex-row sm:px-6 lg:px-8">
          <span>{t("legalCopyright", { year })}</span>
          <div className="flex items-center gap-3 text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              {t("columnSocialTitle")}
            </span>
            {socials.map((social) => {
              const Icon = social.icon
              return (
                <Link
                  key={social.key}
                  href="#"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm transition hover:text-emerald-700 hover:shadow-md"
                  aria-label={t(social.key)}
                // TODO: replace # with real social URLs
                >
                  <Icon className="h-4 w-4" />
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </footer>
  )
}
