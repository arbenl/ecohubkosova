"use client"

import { useState } from "react"

export default function ShtoTregun() {
  const [emri, setEmri] = useState("")
  const [pershkrimi, setPershkrimi] = useState("")
  const [vendndodhja, setVendndodhja] = useState("")
  const [fotoUrl, setFotoUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")
    setError("")

    if (!emri || !pershkrimi || !vendndodhja || !fotoUrl) {
      setError("Ju lutem plotësoni të gjitha fushat.")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/tregu", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emri, pershkrimi, vendndodhja, fotoUrl }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("Artikulli u shtua me sukses!")
        setEmri("")
        setPershkrimi("")
        setVendndodhja("")
        setFotoUrl("")
      } else {
        setError(data.error || "Ndodhi një gabim gjatë shtimit të artikullit.")
      }
    } catch (error) {
      console.error("Gabim gjatë shtimit të artikullit:", error)
      setError("Ndodhi një gabim gjatë shtimit të artikullit.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Shto një Artikull të Ri</h1>
      {message && <div className="bg-green-200 text-green-800 p-2 mb-4">{message}</div>}
      {error && <div className="bg-red-200 text-red-800 p-2 mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="max-w-lg">
        <div className="mb-4">
          <label htmlFor="emri" className="block text-gray-700 text-sm font-bold mb-2">
            Emri i Artikullit:
          </label>
          <input
            type="text"
            id="emri"
            placeholder="Emri i artikullit"
            value={emri}
            onChange={(e) => setEmri(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="pershkrimi" className="block text-gray-700 text-sm font-bold mb-2">
            Përshkrimi:
          </label>
          <textarea
            id="pershkrimi"
            placeholder="Përshkruaj artikullin"
            value={pershkrimi}
            onChange={(e) => setPershkrimi(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="vendndodhja" className="block text-gray-700 text-sm font-bold mb-2">
            Vendndodhja:
          </label>
          <input
            type="text"
            id="vendndodhja"
            placeholder="Vendndodhja e artikullit"
            value={vendndodhja}
            onChange={(e) => setVendndodhja(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="fotoUrl" className="block text-gray-700 text-sm font-bold mb-2">
            URL e Fotos:
          </label>
          <input
            type="text"
            id="fotoUrl"
            placeholder="URL e fotos së artikullit"
            value={fotoUrl}
            onChange={(e) => setFotoUrl(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {isLoading ? "Duke u ngarkuar..." : "Shto Artikullin"}
        </button>
      </form>
    </div>
  )
}
