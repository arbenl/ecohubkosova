import MarketplaceLandingClient from "./marketplace-landing-client"
import { getServerUser } from "@/lib/supabase/server"

interface MarketplacePageProps {
  params: {
    locale: string
  }
  searchParams?: Record<string, string | string[] | undefined>
}

export default async function MarketplacePageServer({
  params,
  searchParams,
}: MarketplacePageProps) {
  const { locale } = await params
  const { user } = await getServerUser()

  return (
    <MarketplaceLandingClient
      locale={locale}
      user={user}
      initialSearchParams={searchParams ?? {}}
    />
  )
}
