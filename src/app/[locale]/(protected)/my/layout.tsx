import type { ReactNode } from "react"
import { setRequestLocale, getTranslations } from "next-intl/server"
import { LayoutDashboard, Bookmark, User, Building2, ShoppingBag } from "lucide-react"
import { DashboardNav } from "./dashboard-nav"

type Props = {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export default async function MyLayout({ children, params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: "DashboardV2" })

  const navItems = [
    {
      label: t("nav.overview"),
      description: t("nav.overviewDesc"),
      href: "/my",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      label: t("nav.listings"),
      description: t("nav.listingsDesc"),
      href: "/my/listings",
      icon: <ShoppingBag className="h-4 w-4" />,
    },
    {
      label: t("nav.saved"),
      description: t("nav.savedDesc"),
      href: "/my/saved-listings",
      icon: <Bookmark className="h-4 w-4" />,
    },
    {
      label: t("nav.profile"),
      description: t("nav.profileDesc"),
      href: "/my/profile",
      icon: <User className="h-4 w-4" />,
    },
    {
      label: t("nav.organization"),
      description: t("nav.organizationDesc"),
      href: "/my/organization",
      icon: <Building2 className="h-4 w-4" />,
    },
  ]

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 space-y-6">
      <div className="grid gap-6 lg:grid-cols-[260px,1fr]">
        <DashboardNav
          items={navItems}
          ctaLabel={t("nav.addListing")}
          heading={t("nav.workspace")}
          eyebrow={t("title")}
        />
        <div className="min-w-0 space-y-6">{children}</div>
      </div>
    </div>
  )
}
