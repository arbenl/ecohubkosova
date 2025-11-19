"use client"

import { useCallback, useState } from "react"
import { adminArticleCreateSchema, adminArticleUpdateSchema } from "@/validation/admin"
import { createArticle, deleteArticle, updateArticle } from "@/app/[locale]/(protected)/admin/articles/actions"
import type { AdminArticle } from "@/services/admin/articles"

export type { AdminArticle } from "@/services/admin/articles"

export function useAdminArticles(initialArticles: AdminArticle[]) {
  const [articles, setArticles] = useState<AdminArticle[]>(initialArticles)
  const [editingArticle, setEditingArticle] = useState<AdminArticle | null>(null)
  const [newArticle, setNewArticle] = useState({
    title: "",
    content: "",
    external_url: "",
    original_language: "",
    category: "",
    is_published: false,
    tags: "",
    featured_image: "",
  })

  const handleDelete = useCallback(async (id: string) => {
    if (!window.confirm("A jeni i sigurt që doni ta fshini këtë artikull?")) {
      return
    }

    const result = await deleteArticle(id)
    if (result.error) {
      alert(result.error)
      return
    }

    setArticles((prev) => prev.filter((article) => article.id !== id))
    alert("Artikulli u fshi me sukses!")
  }, [])

  const handleNewChange = useCallback(
    (key: keyof typeof newArticle, value: string | boolean) => {
      setNewArticle((prev) => ({ ...prev, [key]: value }))
    },
    []
  )

  const handleNewSubmit = useCallback(async () => {
    const tagsArray = newArticle.tags ? newArticle.tags.split(",").map((tag) => tag.trim()) : null
    const payload = {
      title: newArticle.title,
      content: newArticle.content || null,
      external_url: newArticle.external_url || null,
      original_language: newArticle.original_language || null,
      category: newArticle.category,
      is_published: newArticle.is_published,
      tags: tagsArray,
      featured_image: newArticle.featured_image || null,
    }

    const parsed = adminArticleCreateSchema.safeParse(payload)
    if (!parsed.success) {
      alert(parsed.error.issues.map((issue) => issue.message).join("\n"))
      return
    }

    const result = await createArticle(parsed.data)
    if (result.error) {
      alert(result.error)
      return
    }

    alert("Artikulli u krijua me sukses!")
    setNewArticle({
      title: "",
      content: "",
      external_url: "",
      original_language: "",
      category: "",
      is_published: false,
      tags: "",
      featured_image: "",
    })
  }, [newArticle])

  const handleEditSubmit = useCallback(
    async (id: string, payload: ReturnType<typeof adminArticleUpdateSchema["parse"]>) => {
      const result = await updateArticle(id, payload)
      if (result.error) {
        return { error: result.error }
      }

      setArticles((prev) =>
        prev.map((article) => (article.id === id ? { ...article, ...payload } : article))
      )
      alert("Artikulli u përditësua me sukses!")
      return {}
    },
    []
  )

  return {
    articles,
    editingArticle,
    newArticle,
    setEditingArticle,
    handleDelete,
    handleNewChange,
    handleNewSubmit,
    handleEditSubmit,
  }
}
