import { Link } from "@/i18n/routing"
import { getLocale, getTranslations } from "next-intl/server"
import { Briefcase, Camera, Globe } from "lucide-react"

type FooterV2Props = {
  locale?: string
}

export async function FooterV2({ locale }: FooterV2Props = {}) {
  // Prefer an explicitly provided locale (from the layout params) to avoid
  // falling back to the default locale if the request context is missing.
  const resolvedLocale = locale ?? (await getLocale())
  const t = await getTranslations({ locale: resolvedLocale, namespace: "footer" })
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
    { key: "socialFacebook", icon: Globe },
    { key: "socialInstagram", icon: Camera },
    { key: "socialLinkedIn", icon: Briefcase },
  ]

  return (
    <footer className="footer-v2">
      <div className="footer-v2-main">
        <div className="footer-v2-grid">
          <div className="footer-v2-brand-block">
            <div className="footer-v2-brand-row">
              <div className="footer-v2-brand-mark">E</div>
              <div className="footer-v2-brand-copy">
                <p className="footer-v2-brand-title">EcoHub Kosova</p>
                <p className="footer-v2-brand-kicker">Circular marketplace</p>
              </div>
            </div>
            <p className="footer-v2-tagline">{t("tagline")}</p>
          </div>

          <div className="footer-v2-links-grid">
            <div className="footer-v2-column">
              <h3 className="footer-v2-column-title">{t("columnAboutTitle")}</h3>
              <ul className="footer-v2-list">
                {aboutLinks.map((link) => (
                  <li key={link.key}>
                    <Link
                      href={link.href.startsWith("/") ? link.href : `/${link.href}`}
                      className="footer-v2-link"
                    >
                      {t(link.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-v2-column">
              <h3 className="footer-v2-column-title">{t("columnExploreTitle")}</h3>
              <ul className="footer-v2-list">
                {exploreLinks.map((link) => (
                  <li key={link.key}>
                    <Link
                      href={link.href.startsWith("/") ? link.href : `/${link.href}`}
                      className="footer-v2-link"
                    >
                      {t(link.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-v2-column">
              <h3 className="footer-v2-column-title">{t("columnHelpTitle")}</h3>
              <ul className="footer-v2-list">
                {helpLinks.map((link) => (
                  <li key={link.key}>
                    <Link
                      href={link.href.startsWith("/") ? link.href : `/${link.href}`}
                      className="footer-v2-link"
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

      <div className="footer-v2-legal">
        <div className="footer-v2-legal-inner">
          <span>{t("legalCopyright", { year })}</span>
          <div className="footer-v2-socials">
            <span className="footer-v2-social-label">{t("columnSocialTitle")}</span>
            {socials.map((social) => {
              const Icon = social.icon
              return (
                <Link
                  key={social.key}
                  href="#"
                  className="footer-v2-social-link"
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
