"use client"

import { useTransition, useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { ArrowLeft, Search } from "lucide-react"
import { claimOrganizationAction, searchOrganizationsAction } from "./actions"
import type { Organization } from "@/types"

interface ClaimOrganizationFormProps {
  locale: string
  userId: string
  onBack: () => void
}

export default function ClaimOrganizationForm({
  locale,
  userId,
  onBack,
}: ClaimOrganizationFormProps) {
  const t = useTranslations("my-organization")
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [searchTerm, setSearchTerm] = useState("")
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [claimingOrgId, setClaimingOrgId] = useState<string | null>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchTerm.trim()) {
      setOrganizations([])
      return
    }

    setIsSearching(true)
    startTransition(async () => {
      try {
        const result = await searchOrganizationsAction(searchTerm)
        setOrganizations(result.data || [])
      } catch (error) {
        console.error("Search failed:", error)
        setOrganizations([])
      } finally {
        setIsSearching(false)
      }
    })
  }

  const handleClaim = (orgId: string) => {
    setClaimingOrgId(orgId)
    startTransition(async () => {
      const result = await claimOrganizationAction(orgId, locale)

      if (result.error) {
        alert(result.error)
        setClaimingOrgId(null)
      } else if (result.success) {
        router.refresh()
        router.push(`/${locale}/my/organization`)
      }
    })
  }

  return (
    <div className="mx-auto max-w-2xl py-8">
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Kthehu mbrapa
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t("claim.title")}</h1>
        <p className="mt-2 text-gray-600">{t("claim.subtitle")}</p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t("claim.search")}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="rounded-lg bg-emerald-600 px-6 py-2 text-white hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            {isSearching ? "Duke kërkuar..." : "Kërko"}
          </button>
        </div>
      </form>

      {/* Results */}
      <div className="space-y-4">
        {organizations.length === 0 && searchTerm && !isSearching && (
          <div className="rounded-lg bg-yellow-50 p-4 text-yellow-700">
            Nuk u gjet asnjë organizatë që përputhet me kërkimin tuaj.
          </div>
        )}

        {organizations.map((org) => (
          <div
            key={org.id}
            className="flex items-start justify-between rounded-lg border border-gray-200 bg-white p-4"
          >
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{org.name}</h3>
              <p className="mt-1 text-sm text-gray-600">{org.description}</p>
              <div className="mt-2 flex gap-4 text-sm text-gray-500">
                <span>{org.type}</span>
                <span>{org.location}</span>
              </div>
            </div>
            <button
              onClick={() => handleClaim(org.id)}
              disabled={isPending || claimingOrgId === org.id}
              className="ml-4 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {claimingOrgId === org.id && isPending
                ? "Duke kërkuar..."
                : t("claim.requestAccess")}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
