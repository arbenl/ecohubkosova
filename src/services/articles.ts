import { unstable_noStore as noStore } from "next/cache"
import { and, desc, eq, ilike, or } from "drizzle-orm"
import { db } from "@/lib/drizzle"
import { articles, users } from "@/db/schema"

const ITEMS_PER_PAGE = 9

export interface ArticleListOptions {
  search?: string
  category?: string
  page?: number
}

export interface ArticleRecord {
  id: string
  title: string
  content: string
  category: string
  tags: string[] | null
  created_at: string
  users?: {
    full_name?: string | null
  } | null
}

export async function fetchArticlesList({ search = "", category = "all", page = 1 }: ArticleListOptions) {
  noStore()

  try {
    const offset = (page - 1) * ITEMS_PER_PAGE
    const filters: any[] = [eq(articles.is_published, true)]

    if (category !== "all") {
      filters.push(eq(articles.category, category))
    }

    if (search) {
      filters.push(or(ilike(articles.title, `%${search}%`), ilike(articles.content, `%${search}%`)))
    }

    const whereClause = filters.length === 1 ? filters[0] : filters.length > 1 ? and(...filters) : undefined

    const rows = await db
      .get()
      .select({
        article: articles,
        author_name: users.full_name,
      })
      .from(articles)
      .leftJoin(users, eq(articles.author_id, users.id))
      .where(whereClause)
      .orderBy(desc(articles.created_at))
      .limit(ITEMS_PER_PAGE + 1)
      .offset(offset)

    const hasMore = rows.length > ITEMS_PER_PAGE
    const list = rows.slice(0, ITEMS_PER_PAGE).map(({ article, author_name }) => ({
      id: article.id,
      title: article.title,
      content: article.content,
      category: article.category,
      tags: article.tags?.length ? article.tags : null,
      created_at: article.created_at.toISOString(),
      users: {
        full_name: author_name ?? null,
      },
    }))

    return {
      data: list,
      hasMore,
      error: null as string | null,
    }
  } catch (error: unknown) {
    console.error("fetchArticlesList error:", error)
    return {
      data: [] as ArticleRecord[],
      hasMore: false,
      error: error instanceof Error ? error.message : "Gabim gjatë ngarkimit të artikujve.",
    }
  }
}

export async function fetchArticleById(id: string) {
  noStore()

  try {
    const records = await db
      .get()
      .select({
        article: articles,
        author_name: users.full_name,
      })
      .from(articles)
      .leftJoin(users, eq(articles.author_id, users.id))
      .where(eq(articles.id, id))
      .limit(1)
    const record = records[0]

    if (!record) {
      throw new Error("Artikulli nuk u gjet ose nuk është i publikuar.")
    }

    const articleRecord: ArticleRecord = {
      id: record.article.id,
      title: record.article.title,
      content: record.article.content,
      category: record.article.category,
      tags: record.article.tags?.length ? record.article.tags : null,
      created_at: record.article.created_at.toISOString(),
      users: {
        full_name: record.author_name ?? null,
      },
    }

    return { data: articleRecord, error: null as string | null }
  } catch (error: unknown) {
    console.error("fetchArticleById error:", error)
    return {
      data: null,
      error: error instanceof Error ? error.message : "Artikulli nuk u gjet ose nuk është i publikuar.",
    }
  }
}
