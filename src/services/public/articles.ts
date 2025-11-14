import { and, eq, ilike } from "drizzle-orm"
import { db } from "@/lib/drizzle"
import { articles, users } from "@/db/schema"

export type PublicArticle = {
  id: string
  titulli: string
  permbajtja: string
  kategori: string
  tags: string[] | null
  foto_kryesore: string | null
  autori_emri: string | null
  created_at: string
  updated_at: string | null
}

export type PublicArticleFilters = {
  category?: string
  search?: string
}

export async function fetchPublicArticles(filters: PublicArticleFilters = {}) {
  try {
    const conditions = [eq(articles.eshte_publikuar, true)]

    if (filters.category) {
      conditions.push(eq(articles.kategori, filters.category))
    }

    if (filters.search) {
      const term = `%${filters.search}%`
      conditions.push(ilike(articles.titulli, term))
    }

    const rows = await db
      .get()
      .select({
        article: articles,
        author_name: users.emri_i_plote,
      })
      .from(articles)
      .leftJoin(users, eq(articles.autori_id, users.id))
      .where(and(...conditions))
      .orderBy(articles.created_at)

    const data: PublicArticle[] = rows.map(({ article, author_name }) => ({
      id: article.id,
      titulli: article.titulli,
      permbajtja: article.permbajtja,
      kategori: article.kategori,
      tags: article.tags ?? null,
      foto_kryesore: article.foto_kryesore,
      autori_emri: author_name ?? null,
      created_at: article.created_at.toISOString(),
      updated_at: article.updated_at ? article.updated_at.toISOString() : null,
    }))

    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}
