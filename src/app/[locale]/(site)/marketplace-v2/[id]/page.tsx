import { redirect } from "@/i18n/routing"

interface MarketplaceV2DetailPageProps {
  params: Promise<{
    locale: string
    id: string
  }>
}

export default async function MarketplaceV2DetailPage({ params }: MarketplaceV2DetailPageProps) {
  const { locale, id } = await params
  // LEGACY: Redirect from old marketplace-v2 detail routes to new marketplace
  redirect({ href: `/marketplace/${id}`, locale })
  return null
}
