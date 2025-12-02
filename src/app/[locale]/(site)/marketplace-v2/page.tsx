import { redirect } from "@/i18n/routing"

interface MarketplaceV2PageProps {
  params: Promise<{
    locale: string
  }>
}

export default async function MarketplaceV2Page({ params }: MarketplaceV2PageProps) {
  const { locale } = await params
  // Redirect marketplace-v2 to the main marketplace (which is now the landing hub with V2)
  redirect({ href: "/marketplace", locale })
}
