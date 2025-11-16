"use client"

import { useState } from "react"
import { AlertCircle, RotateCcw } from "lucide-react"

interface ProfileRetryUIProps {
  error: string
  onRetry: () => void | Promise<void>
  isLoading?: boolean
  dbUnavailable?: boolean
}

export function ProfileRetryUI({
  error,
  onRetry,
  isLoading = false,
  dbUnavailable = false,
}: ProfileRetryUIProps) {
  const [isRetrying, setIsRetrying] = useState(false)

  const handleRetry = async () => {
    setIsRetrying(true)
    try {
      await onRetry()
    } finally {
      setIsRetrying(false)
    }
  }

  return (
    <div
      className={`rounded-lg border-2 p-6 ${
        dbUnavailable
          ? "border-yellow-300 bg-yellow-50"
          : "border-red-300 bg-red-50"
      }`}
    >
      <div className="flex items-start gap-4">
        <AlertCircle
          className={`mt-1 h-6 w-6 flex-shrink-0 ${
            dbUnavailable ? "text-yellow-600" : "text-red-600"
          }`}
        />
        <div className="flex-1">
          <h3
            className={`text-lg font-semibold ${
              dbUnavailable ? "text-yellow-900" : "text-red-900"
            }`}
          >
            {dbUnavailable ? "Bazë të dhënash jo në dispozicion" : "Gabim në ngarkimin e profilit"}
          </h3>
          <p
            className={`mt-2 ${
              dbUnavailable ? "text-yellow-800" : "text-red-800"
            }`}
          >
            {error || "Ndodhi një gabim i panjohur."}
          </p>
          {dbUnavailable && (
            <p className="mt-2 text-sm text-yellow-700">
              Bazën e të dhënave nuk mund ta marrim. Disa veçori mund të jenë të kufizuara, por mund të
              provoni të hyni përsëri më vonë.
            </p>
          )}
          <button
            onClick={handleRetry}
            disabled={isRetrying || isLoading}
            className={`mt-4 flex items-center gap-2 rounded-md px-4 py-2 font-medium transition-colors ${
              dbUnavailable
                ? "bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-500"
                : "bg-red-600 hover:bg-red-700 disabled:bg-red-500"
            } text-white disabled:cursor-not-allowed`}
          >
            <RotateCcw
              className={`h-4 w-4 ${isRetrying || isLoading ? "animate-spin" : ""}`}
            />
            {isRetrying || isLoading ? "Po rifreskohet..." : "Provo përsëri"}
          </button>
        </div>
      </div>
    </div>
  )
}
