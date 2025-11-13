"use server"

import { fetchArticlesList } from "@/src/services/articles"

interface GetArticlesDataResult {
  initialArticles: Awaited<ReturnType<typeof fetchArticlesList>>["data"]
  hasMoreInitial: boolean
  error: string | null
}

export async function getArticlesData(searchParams: Record<string, string | undefined>): Promise<GetArticlesDataResult> {
  const result = await fetchArticlesList({
    search: searchParams.search,
    category: searchParams.category,
    page: searchParams.page ? Number.parseInt(searchParams.page, 10) : undefined,
  })

  return {
    initialArticles: result.data,
    hasMoreInitial: result.hasMore,
    error: result.error,
  }
}
