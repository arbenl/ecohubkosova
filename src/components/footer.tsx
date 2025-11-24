"use client"

import Link from "next/link"
import { useLocale, useTranslations } from "next-intl"

const footerLinks = [
  { key: "marketplace", href: "marketplace" },
  { key: "organizations", href: "eco-organizations" },
  { key: "partners", href: "partners" },
  { key: "workspace", href: "my/organization" },
]

const supportLinks = [
  { key: "contact", href: "contact" },
  { key: "faq", href: "faq" },
  { key: "help", href: "help" },
  { key: "terms", href: "legal/terms" },
]

export function Footer() {
  const locale = useLocale()
  const t = useTranslations("footer")

  return (
    <footer className="bg-white/90 backdrop-blur border-t border-emerald-100 mt-auto">
      <div className="container px-4 md:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl eco-gradient flex items-center justify-center text-white font-bold text-lg shadow-md">
                E
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-[#00C896] to-[#00A07E] bg-clip-text text-transparent">
                ECO HUB KOSOVA
              </span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">{t("description")}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">{t("links")}</h3>
            <ul className="space-y-3">
              {footerLinks.map((link) => (
                <li key={link.key}>
                  <Link
                    href={`/${locale}/${link.href}`}
                    className="text-sm text-gray-700 hover:text-emerald-700 transition-colors"
                  >
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">{t("support")}</h3>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.key}>
                  <Link
                    href={`/${locale}/${link.href}`}
                    className="text-sm text-gray-700 hover:text-emerald-700 transition-colors"
                  >
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-200 flex flex-col gap-2 md:flex-row md:items-center md:justify-between text-sm text-gray-600">
          <p>
            &copy; {new Date().getFullYear()} ECO HUB KOSOVA. {t("copyright")}
          </p>
          <p className="text-gray-500">{t("supportedBy")}</p>
        </div>
      </div>
    </footer>
  )
}
