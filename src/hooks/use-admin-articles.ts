"use client"

import { useCallback, useState } from "react"
import { adminArticleCreateSchema, adminArticleUpdateSchema } from "@/validation/admin"
import { createArticle, deleteArticle, updateArticle } from "@/app/(private)/admin/articles/actions"

export interface AdminArticle {
  id: string
  titulli: string
  permbajtja: string
  autori_id: string
  eshte_publikuar: boolean
  kategori: string
  tags: string[] | null
  foto_kryesore: string | null
  created_at: string
  updated_at: string | null
}

export function useAdminArticles(initialArticles: AdminArticle[]) {
  const [articles, setArticles] = useState<AdminArticle[]>(initialArticles)
  const [editingArticle, setEditingArticle] = useState<AdminArticle | null>(null)
  const [newArticle, setNewArticle] = useState({
    titulli: "",
    permbajtja: "",
    kategori: "",
    eshte_publikuar: false,
    tags: "",
    foto_kryesore: "",
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
      titulli: newArticle.titulli,
      permbajtja: newArticle.permbajtja,
      kategori: newArticle.kategori,
      eshte_publikuar: newArticle.eshte_publikuar,
      tags: tagsArray,
      foto_kryesore: newArticle.foto_kryesore || null,
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
      titulli: "",
      permbajtja: "",
      kategori: "",
      eshte_publikuar: false,
      tags: "",
      foto_kryesore: "",
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
