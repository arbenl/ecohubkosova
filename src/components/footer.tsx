"use client"

import Link from "next/link"
import { useLocale } from "next-intl"
import { useTranslations } from "next-intl"

export function Footer() {
  const locale = useLocale()
  const t = useTranslations()
  return (
    <footer className="bg-white/80 backdrop-blur-sm border-t border-white/20 py-16 mt-auto shadow-lg">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl eco-gradient flex items-center justify-center text-white font-bold text-lg">
                E
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-[#00C896] to-[#00A07E] bg-clip-text text-transparent">
                ECO HUB KOSOVA
              </span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">{t("footer.description")}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6 text-gray-800">{t("footer.links")}</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href={`/${locale}/marketplace`}
                  className="text-gray-600 hover:text-[#00C896] transition-colors duration-300 text-sm"
                >
                  {t("footer.marketplace")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/eco-organizations`}
                  className="text-gray-600 hover:text-[#00C896] transition-colors duration-300 text-sm"
                >
                  {t("footer.organizations")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/partners`}
                  className="text-gray-600 hover:text-[#00C896] transition-colors duration-300 text-sm"
                >
                  {t("footer.partners")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/knowledge`}
                  className="text-gray-600 hover:text-[#00C896] transition-colors duration-300 text-sm"
                >
                  {t("footer.knowledge")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6 text-gray-800">{t("footer.about")}</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href={`/${locale}/about/vision`}
                  className="text-gray-600 hover:text-[#00C896] transition-colors duration-300 text-sm"
                >
                  {t("footer.whoWeAre")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/about/mission`}
                  className="text-gray-600 hover:text-[#00C896] transition-colors duration-300 text-sm"
                >
                  {t("footer.mission")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/about/coalition`}
                  className="text-gray-600 hover:text-[#00C896] transition-colors duration-300 text-sm"
                >
                  {t("footer.coalition")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6 text-gray-800">{t("footer.support")}</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href={`/${locale}/contact`}
                  className="text-gray-600 hover:text-[#00C896] transition-colors duration-300 text-sm"
                >
                  {t("footer.contact")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/faq`}
                  className="text-gray-600 hover:text-[#00C896] transition-colors duration-300 text-sm"
                >
                  {t("footer.faq")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/help`}
                  className="text-gray-600 hover:text-[#00C896] transition-colors duration-300 text-sm"
                >
                  {t("footer.help")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/legal/terms`}
                  className="text-gray-600 hover:text-[#00C896] transition-colors duration-300 text-sm"
                >
                  {t("footer.terms")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-200 text-center">
          <p className="text-gray-600 text-sm">
            &copy; {new Date().getFullYear()} ECO HUB KOSOVA. {t("footer.copyright")}
          </p>
          <p className="mt-2 text-sm text-gray-500">{t("footer.supportedBy")}</p>
        </div>
      </div>
    </footer>
  )
}
