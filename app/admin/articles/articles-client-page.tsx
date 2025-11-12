"use client"

import { useState } from "react"
import { createArticle, deleteArticle, updateArticle } from "./actions" // Import Server Actions

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

interface ArticlesClientPageProps {
  initialArticles: Article[]
}

const ArticlesClientPage = ({ initialArticles }: ArticlesClientPageProps) => {
  const [articles, setArticles] = useState<Article[]>(initialArticles)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const [newArticle, setNewArticle] = useState({
    titulli: "",
    përmbajtja: "",
    kategori: "",
    eshte_publikuar: false,
    tags: "",
    foto_kryesore: "",
  })

  const handleEdit = (article: Article) => {
    setEditingArticle(article)
  }

  const handleCancelEdit = () => {
    setEditingArticle(null)
  }

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("A jeni i sigurt që doni ta fshini këtë artikull?")
    if (!confirmDelete) return

    const result = await deleteArticle(id)
    if (result.error) {
      alert(result.error)
    } else {
      setArticles(articles.filter((article) => article.id !== id))
      alert("Artikulli u fshi me sukses!")
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewArticle({
      ...newArticle,
      [e.target.name]: e.target.value,
    })
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewArticle({
      ...newArticle,
      eshte_publikuar: e.target.checked,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const tagsArray = newArticle.tags ? newArticle.tags.split(",").map((tag) => tag.trim()) : null

    const result = await createArticle({
      titulli: newArticle.titulli,
      përmbajtja: newArticle.përmbajtja,
      kategori: newArticle.kategori,
      eshte_publikuar: newArticle.eshte_publikuar,
      tags: tagsArray,
      foto_kryesore: newArticle.foto_kryesore || null,
    })

    if (result.error) {
      alert(result.error)
    } else {
      // Re-fetch articles to update the list, or optimistically update
      // For simplicity, we'll just alert success and let revalidatePath handle the actual update
      alert("Artikulli u krijua me sukses!")
      setNewArticle({
        titulli: "",
        përmbajtja: "",
        kategori: "",
        eshte_publikuar: false,
        tags: "",
        foto_kryesore: "",
      })
      // A full re-fetch might be needed if the server action doesn't trigger revalidation immediately
      // For now, we rely on revalidatePath in the server action
    }
  }

  return (
    <>
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

                const result = await updateArticle(editingArticle.id, updatedData)

                if (result.error) {
                  alert(result.error)
                } else {
                  setArticles(articles.map(a => a.id === editingArticle.id ? { ...a, ...updatedData } : a));
                  setEditingArticle(null)
                  alert("Artikulli u përditësua me sukses!")
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
    </>
  )
}

export default ArticlesClientPage