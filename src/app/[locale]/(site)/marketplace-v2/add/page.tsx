import { redirect } from "@/i18n/routing"

interface MarketplaceV2AddPageProps {
  params: Promise<{
    locale: string
  }>
}

export default async function MarketplaceV2AddPage({ params }: MarketplaceV2AddPageProps) {
  const { locale } = await params
  // LEGACY: Redirect from old marketplace-v2 create routes to new marketplace
  redirect({ href: "/marketplace/add", locale })
}
