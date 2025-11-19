import { getLocale } from "next-intl/server"
import { redirect } from "next/navigation"

interface ArticleDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const locale = await getLocale()
  const resolvedParams = await params
  
  // Redirect to the correct articles route
  redirect(`/${locale}/knowledge/articles/${resolvedParams.id}`)
}
