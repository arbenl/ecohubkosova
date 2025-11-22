import { redirect } from "next/navigation"

interface MarketplaceV2EditPageProps {
  params: Promise<{
    locale: string
    id: string
  }>
}

export default async function MarketplaceV2EditPage({
  params,
}: MarketplaceV2EditPageProps) {
  const { locale, id } = await params
  // LEGACY: Redirect from old marketplace-v2 edit routes to new marketplace
  redirect(`/${locale}/marketplace/${id}`)
}
