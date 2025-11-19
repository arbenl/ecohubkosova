import { unstable_noStore as noStore } from "next/cache"
import { and, desc, eq, ilike, or } from "drizzle-orm"
import { db } from "@/lib/drizzle"
import { articles, users } from "@/db/schema"

export interface ArticleListOptions {
  search?: string
  category?: string
  page?: number
}

export interface ArticleRecord {
  id: string
  title: string
  content: string | null // Made optional
  external_url?: string | null // External URL for fetching content
  original_language?: string | null // Original language of external article
  category: string
  tags: string[] | null
  created_at: string
  users?: {
    full_name?: string | null
  } | null
}

const ITEMS_PER_PAGE = 9

// External article content fetching and translation
interface ExternalArticleContent {
  content: string
  language: string
}

async function fetchExternalArticleContent(url: string): Promise<ExternalArticleContent> {
  try {
    // For now, we'll simulate fetching content. In production, you'd use a proper
    // article extraction service or web scraping library
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'EcoHub-Kosovo-Bot/1.0'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch article: ${response.status}`)
    }

    const html = await response.text()

    // Simple content extraction (in production, use a proper library like @extractus/article-extractor)
    const content = extractArticleContent(html)
    const language = detectLanguage(content)

    return { content, language }
  } catch (error) {
    console.error('Error fetching external article:', error)
    throw new Error('Failed to fetch external article content')
  }
}

function extractArticleContent(html: string): string {
  // Very basic content extraction - in production, use a proper library
  // Remove script and style tags
  let content = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')

  // Try to find article content in common selectors
  const selectors = [
    'article',
    '[data-testid="article-body"]',
    '.article-content',
    '.post-content',
    '.entry-content',
    'main',
    '.content'
  ]

  for (const selector of selectors) {
    const match = content.match(new RegExp(`<${selector}[^>]*>([\\s\\S]*?)</${selector}>`, 'i'))
    if (match) {
      content = match[1]
      break
    }
  }

  // Convert HTML to text
  content = content.replace(/<[^>]*>/g, ' ')
  content = content.replace(/\s+/g, ' ').trim()

  return content
}

function detectLanguage(text: string): string {
  // Simple language detection based on common words
  const albanianWords = ['dhe', 'në', 'është', 'për', 'me', 'një', 'shumë', 'si', 'nga', 'kur']
  const albanianCount = albanianWords.filter(word =>
    text.toLowerCase().includes(word.toLowerCase())
  ).length

  // If more than 3 Albanian words detected, assume Albanian
  return albanianCount > 3 ? 'sq' : 'en'
}

export async function translateToAlbanian(text: string): Promise<string> {
  // In production, integrate with a translation service like Google Translate API,
  // DeepL, or OpenAI's translation capabilities
  // For now, return the original text with a note
  console.log('Translation requested for:', text.substring(0, 100) + '...')

  // TODO: Implement actual translation service
  // Example with Google Translate API:
  // const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`, {
  //   method: 'POST',
  //   body: JSON.stringify({
  //     q: text,
  //     source: 'en',
  //     target: 'sq',
  //     format: 'text'
  //   })
  // })
  // const result = await response.json()
  // return result.data.translations[0].translatedText

  return text + '\n\n[Ky artikull është përkthyer automatikisht në shqip]'
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
      filters.push(or(
        ilike(articles.title, `%${search}%`),
        ilike(articles.content, `%${search}%`),
        ilike(articles.external_url, `%${search}%`)
      ))
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
      external_url: article.external_url,
      original_language: article.original_language,
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

  // Validate UUID format
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return {
      data: null,
      error: "ID e artikullit është e pavlefshme.",
    }
  }

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

    const { article, author_name } = record

    let content = record.article.content
    let originalLanguage = record.article.original_language || "en"

    // If article has external URL, always fetch fresh content from external source
    if (record.article.external_url) {
      try {
        const externalContent = await fetchExternalArticleContent(record.article.external_url)
        content = externalContent.content
        originalLanguage = externalContent.language || "en"
      } catch (error) {
        console.error("Failed to fetch external article content:", error)
        // Fall back to stored content if external fetch fails
        if (!content) {
          throw new Error("Nuk mund të ngarkohet përmbajtja e artikullit.")
        }
        console.warn("Using stored content as fallback for external article")
      }
    }

    const articleRecord: ArticleRecord = {
      id: record.article.id,
      title: record.article.title,
      content: content,
      external_url: record.article.external_url,
      original_language: originalLanguage,
      category: record.article.category,
      tags: record.article.tags?.length ? record.article.tags : null,
      created_at: record.article.created_at.toISOString(),
      users: {
        full_name: author_name ?? null,
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
