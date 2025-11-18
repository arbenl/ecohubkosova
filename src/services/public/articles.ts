import { and, eq, ilike } from "drizzle-orm"
import { db } from "@/lib/drizzle"
import { articles, users } from "@/db/schema"

export type PublicArticle = {
  id: string
  title: string
  content: string
  category: string
  tags: string[] | null
  featured_image: string | null
  author_name: string | null
  created_at: string
  updated_at: string | null
}

export type PublicArticleFilters = {
  category?: string
  search?: string
}

export async function fetchPublicArticles(filters: PublicArticleFilters = {}) {
  try {
    const conditions = [eq(articles.is_published, true)]

    if (filters.category) {
      conditions.push(eq(articles.category, filters.category))
    }

    if (filters.search) {
      const term = `%${filters.search}%`
      conditions.push(ilike(articles.title, term))
    }

    const rows = await db
      .get()
      .select({
        article: articles,
        author_name: users.full_name,
      })
      .from(articles)
      .leftJoin(users, eq(articles.author_id, users.id))
      .where(and(...conditions))
      .orderBy(articles.created_at)

    const data: PublicArticle[] = rows.map(({ article, author_name }) => ({
      id: article.id,
      title: article.title,
      content: article.content,
      category: article.category,
      tags: article.tags ?? null,
      featured_image: article.featured_image,
      author_name: author_name ?? null,
      created_at: article.created_at.toISOString(),
      updated_at: article.updated_at ? article.updated_at.toISOString() : null,
    }))

    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}
