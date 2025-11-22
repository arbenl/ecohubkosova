import MarketplaceClientPage from "./marketplace-client-page"
import { getServerUser } from "@/lib/supabase/server"

interface MarketplacePageProps {
  params: Promise<{
    locale: string
  }>
  searchParams?: Record<string, string | string[] | undefined>
}

export default async function MarketplacePageServer({
  params,
  searchParams,
}: MarketplacePageProps) {
  const { locale } = await params
  const { user } = await getServerUser()

  return <MarketplaceClientPage locale={locale} initialSearchParams={searchParams ?? {}} />
}
