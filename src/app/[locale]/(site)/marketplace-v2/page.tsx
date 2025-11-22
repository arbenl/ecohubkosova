import { redirect } from "next/navigation"

interface MarketplaceV2PageProps {
  params: Promise<{
    locale: string
  }>
}

export default async function MarketplaceV2Page({
  params,
}: MarketplaceV2PageProps) {
  const { locale } = await params
  // Redirect marketplace-v2 to the main marketplace (which is now the landing hub with V2)
  redirect(`/${locale}/marketplace`)
}
