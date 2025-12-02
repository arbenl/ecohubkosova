"use client"

import { Link } from "@/i18n/routing"
import { ArrowRight } from "lucide-react"
import { useTranslations } from "next-intl"
import { adminArticleUpdateSchema } from "@/validation/admin"
import { useAdminArticles } from "@/hooks/use-admin-articles"

interface ArticlesClientPageProps {
  initialArticles: Parameters<typeof useAdminArticles>[0]
}

export default function ArticlesClientPage({ initialArticles }: ArticlesClientPageProps) {
  const {
    articles,
    editingArticle,
    newArticle,
    setEditingArticle,
    handleDelete,
    handleNewChange,
    handleNewSubmit,
    handleEditSubmit,
  } = useAdminArticles(initialArticles)

  const t = useTranslations("admin")

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold mb-2">{t("articlesAdmin.tableTitle")}</h2>
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-600">
                  {t("articlesAdmin.headers.title")}
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">
                  {t("articlesAdmin.headers.category")}
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">
                  {t("articlesAdmin.headers.type")}
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">
                  {t("articlesAdmin.headers.published")}
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">
                  {t("articlesAdmin.headers.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{article.title}</td>
                  <td className="px-4 py-3">{article.category}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        article.external_url
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {article.external_url
                        ? t("articlesAdmin.type.external")
                        : t("articlesAdmin.type.local")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {article.is_published
                      ? t("articlesAdmin.published.yes")
                      : t("articlesAdmin.published.no")}
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    <button
                      className="text-sm text-blue-600 hover:underline"
                      onClick={() => setEditingArticle(article)}
                    >
                      {t("articlesAdmin.actions.edit")}
                    </button>
                    <button
                      className="text-sm text-red-600 hover:underline"
                      onClick={() => handleDelete(article.id)}
                    >
                      {t("articlesAdmin.actions.delete")}
                    </button>
                    <Link
                      href={`/knowledge/articles/${article.id}`}
                      className="text-sm text-gray-600"
                    >
                      {t("articlesAdmin.actions.view")} <ArrowRight className="inline h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">{t("articlesAdmin.createTitle")}</h2>
        <div className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-white p-4">
          <input
            className="rounded-md border px-3 py-2"
            placeholder={t("articlesAdmin.placeholders.title")}
            value={newArticle.title}
            onChange={(event) => handleNewChange("title", event.target.value)}
          />
          <textarea
            className="rounded-md border px-3 py-2"
            placeholder={t("articlesAdmin.placeholders.content")}
            rows={4}
            value={newArticle.content}
            onChange={(event) => handleNewChange("content", event.target.value)}
          />
          <input
            className="rounded-md border px-3 py-2"
            placeholder={t("articlesAdmin.placeholders.externalUrl")}
            value={newArticle.external_url}
            onChange={(event) => handleNewChange("external_url", event.target.value)}
          />
          <input
            className="rounded-md border px-3 py-2"
            placeholder={t("articlesAdmin.placeholders.originalLanguage")}
            value={newArticle.original_language}
            onChange={(event) => handleNewChange("original_language", event.target.value)}
          />
          <input
            className="rounded-md border px-3 py-2"
            placeholder={t("articlesAdmin.placeholders.category")}
            value={newArticle.category}
            onChange={(event) => handleNewChange("category", event.target.value)}
          />
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-1">
              <input
                type="checkbox"
                id="eshte_publikuar"
                checked={newArticle.is_published}
                onChange={(event) => handleNewChange("is_published", event.target.checked)}
              />
              {t("articlesAdmin.publishNow")}
            </label>
          </div>
          <input
            className="rounded-md border px-3 py-2"
            placeholder={t("articlesAdmin.placeholders.tags")}
            value={newArticle.tags}
            onChange={(event) => handleNewChange("tags", event.target.value)}
          />
          <input
            className="rounded-md border px-3 py-2"
            placeholder={t("articlesAdmin.placeholders.featuredImage")}
            value={newArticle.featured_image}
            onChange={(event) => handleNewChange("featured_image", event.target.value)}
          />
          <button
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            type="button"
            onClick={handleNewSubmit}
          >
            {t("articlesAdmin.submitCreate")}
          </button>
        </div>
      </section>

      {editingArticle && (
        <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="text-lg font-semibold">{t("articlesAdmin.editTitle")}</h2>
          <form
            className="space-y-3"
            onSubmit={async (event) => {
              event.preventDefault()
              const formData = new FormData(event.currentTarget)
              const updatedData = {
                title: formData.get("title") as string,
                content: (formData.get("content") as string) || null,
                external_url: (formData.get("external_url") as string) || null,
                original_language: (formData.get("original_language") as string) || null,
                category: formData.get("category") as string,
                is_published: formData.get("is_published") === "on",
                tags: (formData.get("tags") as string)?.split(",").map((tag) => tag.trim()),
                featured_image: (formData.get("featured_image") as string) || null,
              }

              const parsed = adminArticleUpdateSchema.safeParse(updatedData)
              if (!parsed.success) {
                alert(parsed.error.issues.map((issue) => issue.message).join("\n"))
                return
              }

              await handleEditSubmit(editingArticle.id, parsed.data)
              setEditingArticle(null)
            }}
          >
            <input
              name="title"
              defaultValue={editingArticle.title}
              className="w-full rounded-md border px-3 py-2"
            />
            <textarea
              name="content"
              defaultValue={editingArticle.content || ""}
              rows={4}
              className="w-full rounded-md border px-3 py-2"
            />
            <input
              name="external_url"
              defaultValue={editingArticle.external_url || ""}
              placeholder={t("articlesAdmin.placeholders.externalUrl")}
              className="w-full rounded-md border px-3 py-2"
            />
            <input
              name="original_language"
              defaultValue={editingArticle.original_language || ""}
              placeholder={t("articlesAdmin.placeholders.originalLanguage")}
              className="w-full rounded-md border px-3 py-2"
            />
            <input
              name="category"
              defaultValue={editingArticle.category}
              className="w-full rounded-md border px-3 py-2"
            />
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                name="is_published"
                defaultChecked={editingArticle.is_published}
                className="h-4 w-4"
              />
              {t("articlesAdmin.headers.published")}
            </label>
            <input
              name="tags"
              defaultValue={editingArticle.tags?.join(", ")}
              className="w-full rounded-md border px-3 py-2"
            />
            <input
              name="featured_image"
              defaultValue={editingArticle.featured_image ?? ""}
              className="w-full rounded-md border px-3 py-2"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                {t("articlesAdmin.save")}
              </button>
              <button
                type="button"
                className="rounded-md bg-gray-200 px-4 py-2 text-gray-700"
                onClick={() => setEditingArticle(null)}
              >
                {t("articlesAdmin.cancel")}
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  )
}
