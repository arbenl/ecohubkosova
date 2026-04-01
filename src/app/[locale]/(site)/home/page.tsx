import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import {
  UserPlus,
  Search,
  MessageCircle,
  ShoppingCart,
  Sparkles,
  Leaf,
  Users,
  LogIn,
  ArrowRight,
} from "lucide-react"
import { getTranslations } from "next-intl/server"

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  const t = await getTranslations({ locale, namespace: "home" })

  return (
    <>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="home-hero-section">
          <div className="home-hero-backdrop" />
          <div className="container home-hero-container">
            <div className="home-hero-shell">
              <div className="home-hero-grid">
                <div className="home-hero-copy animate-slide-in-left">
                  <div className="home-hero-eyebrow">
                    <Sparkles className="home-hero-eyebrow-icon" />
                    {t("hero.supportedBy")}
                  </div>

                  <h1 className="home-hero-title">
                    {t("hero.titleStart")}{" "}
                    <span className="home-hero-title-accent">{t("hero.titleEnd")}</span>
                  </h1>

                  <p className="home-hero-subtitle">{t("hero.subtitle")}</p>

                  <div className="home-hero-actions">
                    <Button size="lg" className="home-hero-primary-cta" asChild>
                      <Link href="/register">
                        <UserPlus className="mr-2 h-5 w-5" />
                        {t("hero.ctaRegister")}
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="home-hero-secondary-cta" asChild>
                      <Link href="/marketplace">
                        <Search className="mr-2 h-5 w-5" />
                        {t("hero.ctaMarketplace")}
                      </Link>
                    </Button>
                  </div>

                  <div className="home-hero-signin-row">
                    <span>{t("hero.haveAccount")}</span>
                    <Button variant="link" className="home-hero-signin-link" asChild>
                      <Link href="/login">
                        <LogIn className="mr-1 h-4 w-4" />
                        {t("hero.signIn")}
                      </Link>
                    </Button>
                  </div>

                  <div className="home-hero-feature-grid">
                    <div className="home-hero-feature-card">
                      <p className="home-hero-feature-title">{t("howItWorks.step1Title")}</p>
                      <p className="home-hero-feature-body">{t("howItWorks.step1Body")}</p>
                    </div>
                    <div className="home-hero-feature-card">
                      <p className="home-hero-feature-title">{t("howItWorks.step2Title")}</p>
                      <p className="home-hero-feature-body">{t("howItWorks.step2Body")}</p>
                    </div>
                    <div className="home-hero-feature-card">
                      <p className="home-hero-feature-title">{t("howItWorks.step3Title")}</p>
                      <p className="home-hero-feature-body">{t("howItWorks.step3Body")}</p>
                    </div>
                  </div>
                </div>

                <div className="home-hero-visual animate-slide-in-right">
                  <div className="home-hero-main-panel">
                    <div className="home-hero-panel-header">
                      <div className="home-hero-panel-pill">{t("marketplace.title")}</div>
                      <Leaf className="home-hero-panel-icon" />
                    </div>

                    <div className="home-hero-panel-grid">
                      <div className="home-hero-highlight-card">
                        <div className="home-hero-highlight-visual">
                          <div className="home-hero-highlight-badge">
                            <ShoppingCart className="h-4 w-4" />
                            {t("marketplace.forSaleTitle")}
                          </div>
                        </div>
                        <h3 className="home-hero-highlight-title">{t("marketplace.title")}</h3>
                        <p className="home-hero-highlight-body">{t("marketplace.subtitle")}</p>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="home-hero-highlight-cta"
                          asChild
                        >
                          <Link href="/marketplace">
                            {t("hero.ctaMarketplace")}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>

                      <div className="home-hero-mini-grid">
                        <div className="home-hero-mini-card">
                          <div className="home-hero-mini-header">
                            <div className="home-hero-mini-icon">
                              <ShoppingCart className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="home-hero-mini-title">
                                {t("marketplace.forSaleTitle")}
                              </p>
                              <p className="home-hero-mini-caption">
                                {t("marketplace.forSaleCta")}
                              </p>
                            </div>
                          </div>
                          <p className="home-hero-mini-body">{t("marketplace.forSaleBody")}</p>
                        </div>

                        <div className="home-hero-mini-card">
                          <div className="home-hero-mini-header">
                            <div className="home-hero-mini-icon">
                              <Users className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="home-hero-mini-title">{t("marketplace.wantedTitle")}</p>
                              <p className="home-hero-mini-caption">{t("marketplace.wantedCta")}</p>
                            </div>
                          </div>
                          <p className="home-hero-mini-body">{t("marketplace.wantedBody")}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="home-hero-floating-panel">
                    <p className="home-hero-floating-eyebrow">{t("howItWorks.title")}</p>
                    <p className="home-hero-floating-title">{t("howItWorks.subtitle")}</p>
                    <div className="home-hero-floating-list">
                      <div className="home-hero-floating-item">
                        <div className="home-hero-floating-icon">
                          <UserPlus className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="home-hero-floating-item-title">
                            {t("howItWorks.step1Title")}
                          </p>
                          <p className="home-hero-floating-item-body">{t("howItWorks.step1Cta")}</p>
                        </div>
                      </div>
                      <div className="home-hero-floating-item">
                        <div className="home-hero-floating-icon">
                          <Search className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="home-hero-floating-item-title">
                            {t("howItWorks.step2Title")}
                          </p>
                          <p className="home-hero-floating-item-body">{t("howItWorks.step2Cta")}</p>
                        </div>
                      </div>
                      <div className="home-hero-floating-item">
                        <div className="home-hero-floating-icon">
                          <MessageCircle className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="home-hero-floating-item-title">
                            {t("howItWorks.step3Title")}
                          </p>
                          <p className="home-hero-floating-item-body">{t("howItWorks.step3Cta")}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="home-section">
          <div className="container home-section-container">
            <div className="home-section-heading animate-slide-up">
              <h2 className="home-section-title">{t("howItWorks.title")}</h2>
              <p className="home-section-subtitle">{t("howItWorks.subtitle")}</p>
            </div>

            <div className="home-steps-grid">
              <div className="animate-slide-in-left">
                <div className="home-step-card home-step-card--blue">
                  <div className="home-step-icon home-step-icon--blue">
                    <UserPlus className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="home-step-title">{t("howItWorks.step1Title")}</h3>
                  <p className="home-step-body">{t("howItWorks.step1Body")}</p>
                  <Button className="home-step-cta home-step-cta--blue" asChild>
                    <Link href="/marketplace">
                      <UserPlus className="mr-2 h-4 w-4" />
                      {t("howItWorks.step1Cta")}
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="animate-slide-up">
                <div className="home-step-card home-step-card--purple">
                  <div className="home-step-icon home-step-icon--purple">
                    <Search className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="home-step-title">{t("howItWorks.step2Title")}</h3>
                  <p className="home-step-body">{t("howItWorks.step2Body")}</p>
                  <Button className="home-step-cta home-step-cta--purple" asChild>
                    <Link href="/partners">
                      <Search className="mr-2 h-4 w-4" />
                      {t("howItWorks.step2Cta")}
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="animate-slide-in-right">
                <div className="home-step-card home-step-card--emerald">
                  <div className="home-step-icon home-step-icon--emerald">
                    <MessageCircle className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="home-step-title">{t("howItWorks.step3Title")}</h3>
                  <p className="home-step-body">{t("howItWorks.step3Body")}</p>
                  <Button className="home-step-cta home-step-cta--emerald" asChild>
                    <Link href="/marketplace">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      {t("howItWorks.step3Cta")}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Marketplace Overview */}
        <section className="home-marketplace-section">
          <div className="container home-section-container">
            <div className="home-section-heading animate-fade-in">
              <h2 className="home-section-title">{t("marketplace.title")}</h2>
              <p className="home-section-subtitle">{t("marketplace.subtitle")}</p>
            </div>

            <div className="home-marketplace-grid">
              <div className="animate-slide-in-left">
                <div className="home-marketplace-card">
                  <div className="home-marketplace-header">
                    <div className="home-marketplace-icon">
                      <ShoppingCart className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="home-marketplace-card-title">{t("marketplace.forSaleTitle")}</h3>
                  </div>
                  <p className="home-marketplace-card-body">{t("marketplace.forSaleBody")}</p>
                  <Button className="home-marketplace-cta" asChild>
                    <Link href="/marketplace?lloji=shes">
                      <Leaf className="mr-2 h-4 w-4" />
                      {t("marketplace.forSaleCta")}
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="animate-slide-in-right">
                <div className="home-marketplace-card">
                  <div className="home-marketplace-header">
                    <div className="home-marketplace-icon">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="home-marketplace-card-title">{t("marketplace.wantedTitle")}</h3>
                  </div>
                  <p className="home-marketplace-card-body">{t("marketplace.wantedBody")}</p>
                  <Button className="home-marketplace-cta" asChild>
                    <Link href="/marketplace?lloji=blej">
                      <Search className="mr-2 h-4 w-4" />
                      {t("marketplace.wantedCta")}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
