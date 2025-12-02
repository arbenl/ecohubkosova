import { getLocale } from "next-intl/server"
import { redirect } from "@/i18n/routing"

interface ArticleDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const locale = await getLocale()
  const resolvedParams = await params

  // Redirect to the correct articles route
  redirect({ href: `/knowledge/articles/${resolvedParams.id}`, locale })
}
