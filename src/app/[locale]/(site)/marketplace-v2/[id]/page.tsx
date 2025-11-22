import { redirect } from "next/navigation"

interface MarketplaceV2DetailPageProps {
  params: Promise<{
    locale: string
    id: string
  }>
}

export default async function MarketplaceV2DetailPage({
  params,
}: MarketplaceV2DetailPageProps) {
  const { locale, id } = await params
  // LEGACY: Redirect from old marketplace-v2 detail routes to new marketplace
  redirect(`/${locale}/marketplace/${id}`)
}
