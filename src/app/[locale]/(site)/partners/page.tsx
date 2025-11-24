import { getLocale, getTranslations } from "next-intl/server"
import { fetchPartners } from "@/services/partners"
import { PartnersClient } from "./PartnersClient"

export default async function PartnersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { locale } = await params
  const resolvedSearch = await searchParams
  const initialCity = typeof resolvedSearch.city === "string" ? resolvedSearch.city : undefined

  const tRoles = await getTranslations("eco-organizations")

  const allPartners = await fetchPartners()
  const roleLabels = Array.from(
    new Set(allPartners.map((p) => p.org_role).filter(Boolean))
  ).reduce<Record<string, string>>((acc, role) => {
    const label = tRoles(`roleLabels.${role}`)
    acc[role as string] = label
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 md:px-6 py-12">
        <PartnersClient
          locale={locale}
          partners={allPartners}
          roleLabels={roleLabels}
          initialCity={initialCity}
        />
      </div>
    </div>
  )
}
