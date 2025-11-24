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
  let user = null
  try {
    const auth = await getServerUser()
    user = auth.user
  } catch (error) {
    console.error("[Marketplace] Auth check failed, proceeding as guest:", error)
  }

  return <MarketplaceClientPage locale={locale} initialSearchParams={searchParams ?? {}} />
}
