import { redirect } from "@/i18n/routing"

interface ExplorePageProps {
  params: Promise<{
    locale: string
  }>
}

export default async function ExplorePage({ params }: ExplorePageProps) {
  const { locale } = await params
  // Redirect legacy explore page to marketplace
  redirect({ href: "/marketplace", locale })
}
