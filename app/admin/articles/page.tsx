"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

interface Article {
  id: string
  titulli: string
  përmbajtja: string
  autori_id: string
  eshte_publikuar: boolean
  kategori: string
  tags: string[] | null
  foto_kryesore: string | null
  created_at: string
  updated_at: string | null
}

const AdminArticlesPage = () => {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const [newArticle, setNewArticle] = useState({
    titulli: "",
    përmbajtja: "",
    kategori: "",
    eshte_publikuar: false,
    tags: "",
    foto_kryesore: "",
  })

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("artikuj").select("*")
      if (error) {
        console.error("Gabim gjatë marrjes së artikujve:", error)
        alert("Gabim gjatë marrjes së artikujve")
      } else {
        setArticles(data || [])
      }
    } catch (error) {
      console.error("Gabim gjatë marrjes së artikujve:", error)
      alert("Gabim gjatë marrjes së artikujve")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (article: Article) => {
    setEditingArticle(article)
  }

  const handleCancelEdit = () => {
    setEditingArticle(null)
  }

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("A jeni i sigurt që doni ta fshini këtë artikull?")
    if (!confirmDelete) return

    try {
      const { error } = await supabase.from("artikuj").delete().eq("id", id)

      if (error) {
        console.error("Gabim gjatë fshirjes së artikullit:", error)
        alert("Gabim gjatë fshirjes së artikullit")
      } else {
        fetchArticles()
        alert("Artikulli u fshi me sukses!")
      }
    } catch (error) {
      console.error("Gabim gjatë fshirjes së artikullit:", error)
      alert("Gabim gjatë fshirjes së artikullit")
    }
  }

  const handleInputChange = (e: any) => {
    setNewArticle({
      ...newArticle,
      [e.target.name]: e.target.value,
    })
  }

  const handleCheckboxChange = (e: any) => {
    setNewArticle({
      ...newArticle,
      eshte_publikuar: e.target.checked,
    })
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()

    try {
      // Get current user for autori_id
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        alert("Duhet të jeni të kyçur për të krijuar artikuj")
        return
      }

      const tagsArray = newArticle.tags ? newArticle.tags.split(",").map((tag) => tag.trim()) : null

      const { data, error } = await supabase.from("artikuj").insert([
        {
          titulli: newArticle.titulli,
          përmbajtja: newArticle.përmbajtja,
          kategori: newArticle.kategori,
          eshte_publikuar: newArticle.eshte_publikuar,
          tags: tagsArray,
          foto_kryesore: newArticle.foto_kryesore || null,
          autori_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: null,
        },
      ])

      if (error) throw error

      fetchArticles()
      setNewArticle({
        titulli: "",
        përmbajtja: "",
        kategori: "",
        eshte_publikuar: false,
        tags: "",
        foto_kryesore: "",
      })
      alert("Artikulli u krijua me sukses!")
    } catch (error) {
      console.error("Gabim gjatë krijimit të artikullit:", error)
      alert("Gabim gjatë krijimit të artikullit")
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">Duke u ngarkuar artikujt...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Artikujt</h1>

      {/* List of Articles */}
      <div className="mb-5">
        <h2 className="text-lg font-semibold mb-2">Lista e Artikujve</h2>
        {articles.length === 0 ? (
          <p>Nuk ka artikuj.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Titulli</th>
                  <th className="py-2 px-4 border-b">Kategoria</th>
                  <th className="py-2 px-4 border-b">Publikuar</th>
                  <th className="py-2 px-4 border-b">Tags</th>
                  <th className="py-2 px-4 border-b">Veprime</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr key={article.id}>
                    <td className="py-2 px-4 border-b">{article.titulli}</td>
                    <td className="py-2 px-4 border-b">{article.kategori}</td>
                    <td className="py-2 px-4 border-b">{article.eshte_publikuar ? "Po" : "Jo"}</td>
                    <td className="py-2 px-4 border-b">{article.tags?.join(", ") || "Asnjë"}</td>
                    <td className="py-2 px-4 border-b">
                      <button
                        onClick={() => handleEdit(article)}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
                      >
                        Edito
                      </button>
                      <button
                        onClick={() => handleDelete(article.id)}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                      >
                        Fshij
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Article Form */}
      {editingArticle && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-2">Edito Artikullin</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                if (!editingArticle) return

                try {
                  const formData = new FormData(e.currentTarget)
                  const tagsString = formData.get("tags") as string
                  const tagsArray = tagsString ? tagsString.split(",").map((tag) => tag.trim()) : null

                  const updatedData = {
                    titulli: formData.get("titulli") as string,
                    përmbajtja: formData.get("përmbajtja") as string,
                    kategori: formData.get("kategori") as string,
                    eshte_publikuar: formData.get("eshte_publikuar") === "on",
                    tags: tagsArray,
                    foto_kryesore: (formData.get("foto_kryesore") as string) || null,
                    updated_at: new Date().toISOString(),
                  }

                  const { error } = await supabase.from("artikuj").update(updatedData).eq("id", editingArticle.id)

                  if (error) throw error

                  fetchArticles()
                  setEditingArticle(null)
                  alert("Artikulli u përditësua me sukses!")
                } catch (error) {
                  console.error("Gabim gjatë përditësimit të artikullit:", error)
                  alert("Gabim gjatë përditësimit të artikullit")
                }
              }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="titulli" className="block text-sm font-medium text-gray-700">
                  Titulli:
                </label>
                <input
                  type="text"
                  id="titulli"
                  name="titulli"
                  defaultValue={editingArticle.titulli}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label htmlFor="përmbajtja" className="block text-sm font-medium text-gray-700">
                  Përmbajtja:
                </label>
                <textarea
                  id="përmbajtja"
                  name="përmbajtja"
                  rows={4}
                  defaultValue={editingArticle.përmbajtja}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label htmlFor="kategori" className="block text-sm font-medium text-gray-700">
                  Kategoria:
                </label>
                <input
                  type="text"
                  id="kategori"
                  name="kategori"
                  defaultValue={editingArticle.kategori}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                  Tags (të ndara me presje):
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  defaultValue={editingArticle.tags?.join(", ") || ""}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label htmlFor="foto_kryesore" className="block text-sm font-medium text-gray-700">
                  Foto Kryesore (URL):
                </label>
                <input
                  type="url"
                  id="foto_kryesore"
                  name="foto_kryesore"
                  defaultValue={editingArticle.foto_kryesore || ""}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="eshte_publikuar"
                    name="eshte_publikuar"
                    type="checkbox"
                    defaultChecked={editingArticle.eshte_publikuar}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="eshte_publikuar" className="font-medium text-gray-700">
                    Eshte Publikuar
                  </label>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                >
                  Anulo
                </button>
                <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                  Ruaj Ndryshimet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Article Form */}
      <div className="mb-5">
        <h2 className="text-lg font-semibold mb-2">Krijo Artikull të Ri</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="titulli" className="block text-sm font-medium text-gray-700">
              Titulli:
            </label>
            <input
              type="text"
              id="titulli"
              name="titulli"
              value={newArticle.titulli}
              onChange={handleInputChange}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label htmlFor="përmbajtja" className="block text-sm font-medium text-gray-700">
              Përmbajtja:
            </label>
            <textarea
              id="përmbajtja"
              name="përmbajtja"
              rows={4}
              value={newArticle.përmbajtja}
              onChange={handleInputChange}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label htmlFor="kategori" className="block text-sm font-medium text-gray-700">
              Kategoria:
            </label>
            <input
              type="text"
              id="kategori"
              name="kategori"
              value={newArticle.kategori}
              onChange={handleInputChange}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
              Tags (të ndara me presje):
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={newArticle.tags}
              onChange={handleInputChange}
              placeholder="tag1, tag2, tag3"
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label htmlFor="foto_kryesore" className="block text-sm font-medium text-gray-700">
              Foto Kryesore (URL):
            </label>
            <input
              type="url"
              id="foto_kryesore"
              name="foto_kryesore"
              value={newArticle.foto_kryesore}
              onChange={handleInputChange}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="eshte_publikuar"
                name="eshte_publikuar"
                type="checkbox"
                checked={newArticle.eshte_publikuar}
                onChange={handleCheckboxChange}
                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="eshte_publikuar" className="font-medium text-gray-700">
                Eshte Publikuar
              </label>
            </div>
          </div>
          <div>
            <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
              Shto Artikull
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminArticlesPage
