"use client"

import { useMemo, useState } from "react"
import { Link } from "@/i18n/routing"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import clsx from "clsx"
import type { Partner } from "@/services/partners"
import { ArrowUpRight, MapPin, Mail, ShieldCheck, X } from "lucide-react"
import { useAuth } from "@/lib/auth-provider"
import { PublicPageHero } from "@/components/layout/PublicPageHero"

type PartnersClientProps = {
  locale: string
  partners: Partner[]
  roleLabels: Record<string, string>
  initialCity?: string
}

type RoleFilter = {
  value: string
  labelKey: string
}

export function PartnersClient({ locale, partners, roleLabels, initialCity }: PartnersClientProps) {
  const t = useTranslations("partners")
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const roleBadgeStyles: Record<
    string,
    { bg: string; text: string; ring: string; border: string }
  > = {
    RECYCLER: {
      bg: "bg-emerald-50",
      text: "text-emerald-800",
      ring: "ring-emerald-100",
      border: "border-emerald-200",
    },
    COLLECTOR: {
      bg: "bg-amber-50",
      text: "text-amber-800",
      ring: "ring-amber-100",
      border: "border-amber-200",
    },
    SERVICE_PROVIDER: {
      bg: "bg-blue-50",
      text: "text-blue-800",
      ring: "ring-blue-100",
      border: "border-blue-200",
    },
    NGO: {
      bg: "bg-purple-50",
      text: "text-purple-800",
      ring: "ring-purple-100",
      border: "border-purple-200",
    },
    SOCIAL_ENTERPRISE: {
      bg: "bg-indigo-50",
      text: "text-indigo-800",
      ring: "ring-indigo-100",
      border: "border-indigo-200",
    },
    PUBLIC_INSTITUTION: {
      bg: "bg-sky-50",
      text: "text-sky-800",
      ring: "ring-sky-100",
      border: "border-sky-200",
    },
  }

  const roleFilters: RoleFilter[] = [
    { value: "all", labelKey: "filters.role.all" },
    { value: "RECYCLER", labelKey: "filters.role.RECYCLER" },
    { value: "SERVICE_PROVIDER", labelKey: "filters.role.SERVICE_PROVIDER" },
    { value: "NGO", labelKey: "filters.role.OJQ" },
    { value: "SOCIAL_ENTERPRISE", labelKey: "filters.role.SOCIAL_ENTERPRISE" },
    { value: "COLLECTOR", labelKey: "filters.role.COLLECTOR" },
    { value: "PUBLIC_INSTITUTION", labelKey: "filters.role.PUBLIC_INSTITUTION" },
  ]

  const [activeRole, setActiveRole] = useState<string>("all")
  const [selectedCity, setSelectedCity] = useState<string | undefined>(initialCity)

  const updateCityFilter = (city?: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (!city) {
      params.delete("city")
    } else {
      params.set("city", city)
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
    setSelectedCity(city)
  }

  const CTA_TARGET_FALLBACK = `/${locale}/dashboard`
  const ctaHref = user?.id
    ? CTA_TARGET_FALLBACK
    : `/${locale}/login?next=${encodeURIComponent(CTA_TARGET_FALLBACK)}`

  const stats = useMemo(() => {
    const totalOrgs = partners.length
    const cities = new Set(
      partners.map((p) => p.city).filter((city): city is string => Boolean(city))
    ).size
    const roles = new Set(
      partners.map((p) => p.org_role).filter((role): role is string => Boolean(role))
    ).size

    return { totalOrgs, cities, roles }
  }, [partners])

  const filteredPartners = useMemo(() => {
    return partners.filter((partner) => {
      const matchesRole = activeRole === "all" || partner.org_role === activeRole
      const matchesCity =
        !selectedCity || (partner.city && partner.city.toLowerCase() === selectedCity.toLowerCase())
      return matchesRole && matchesCity
    })
  }, [partners, activeRole, selectedCity])

  const resolveRoleLabel = (role?: string | null) => {
    if (!role) return null
    if (roleLabels[role]) return roleLabels[role]
    try {
      return t(`card.roleLabels.${role}`)
    } catch {
      return role
    }
  }

  const badgeClassesForRole = (role?: string | null) => {
    if (!role) return "bg-slate-50 text-slate-700 ring-1 ring-slate-100 border border-slate-200"
    const styles = roleBadgeStyles[role]
    if (!styles) return "bg-slate-50 text-slate-700 ring-1 ring-slate-100 border border-slate-200"
    return `${styles.bg} ${styles.text} ring-1 ${styles.ring} border ${styles.border}`
  }

  return (
    <div className="min-h-screen space-y-10 pb-16 bg-white">
      <PublicPageHero
        namespace="partners"
        titleKey="page.title"
        subtitleKey="page.subtitle"
        variant="campaign"
        actions={
          <>
            <Link
              href={ctaHref}
              className={clsx(
                "rounded-full bg-white text-emerald-700 px-5 py-2 text-sm font-semibold shadow-sm transition",
                "hover:bg-emerald-50",
                isLoading && "pointer-events-none opacity-70"
              )}
            >
              {t("hero.ctaBecomePartner")}
            </Link>
            <Link
              href="/marketplace"
              className="rounded-full border border-white/70 px-5 py-2 text-sm font-semibold text-white hover:bg-white/10 transition"
            >
              {t("hero.ctaViewMarketplace")}
            </Link>
          </>
        }
      >
        <div className="text-sm md:text-base text-emerald-50/90">
          {stats.totalOrgs} {t("stats.organizations")} · {stats.cities} {t("stats.cities")} ·{" "}
          {stats.roles} {t("stats.roles")}
        </div>
      </PublicPageHero>

      <div className="mx-auto max-w-6xl space-y-8">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {roleFilters.map((role) => (
            <button
              key={role.value}
              type="button"
              onClick={() => setActiveRole(role.value)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                activeRole === role.value
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                  : "border-gray-200 bg-white text-gray-600 hover:border-emerald-300"
              }`}
            >
              {t(role.labelKey)}
            </button>
          ))}
          {selectedCity && (
            <button
              type="button"
              onClick={() => updateCityFilter(undefined)}
              className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition"
            >
              {selectedCity}
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPartners.map((partner) => {
            if (!partner.eco_org_id) {
              console.warn("[PartnersClient] Partner missing eco_org_id:", partner.name, partner)
              return null
            }
            const partnerId = partner.eco_org_id ?? partner.id
            const roleLabel = resolveRoleLabel(partner.org_role)
            const roleBadgeClass = badgeClassesForRole(partner.org_role)
            const wasteTags = partner.waste_types_handled?.slice(0, 2) ?? []
            const serviceTags = partner.service_areas?.slice(0, 2) ?? []

            return (
              <article
                key={partner.eco_org_id}
                className="group flex h-full flex-col gap-4 rounded-2xl border border-emerald-100/70 bg-white/80 p-5 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-xl md:p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-1 items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-lg font-semibold text-emerald-700">
                      {partner.name.charAt(0)}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold text-slate-900">{partner.name}</h3>
                      {partner.city && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            updateCityFilter(partner.city!)
                          }}
                          className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-emerald-600 hover:underline group/city"
                        >
                          <MapPin className="h-4 w-4 text-emerald-500 group-hover/city:text-emerald-600" />
                          <span>{partner.city}</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {roleLabel && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setActiveRole(partner.org_role || "all")
                        }}
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition-all cursor-pointer hover:ring-2 hover:ring-offset-1 ${roleBadgeClass}`}
                        title={t("filters.role.all")}
                      >
                        {roleLabel}
                      </button>
                    )}
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                        partner.verification_status === "VERIFIED"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-slate-50 text-slate-700"
                      }`}
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {partner.verification_status === "VERIFIED"
                        ? t("card.verifiedBadge")
                        : t("card.communityLabel")}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {(wasteTags.length > 0 || serviceTags.length > 0) && (
                    <div className="flex flex-wrap gap-2 text-xs">
                      {wasteTags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 font-medium text-emerald-700"
                        >
                          {tag}
                        </span>
                      ))}
                      {serviceTags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-0.5 font-medium text-sky-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {partner.description && (
                    <p className="text-sm text-slate-700 line-clamp-3">{partner.description}</p>
                  )}
                </div>

                <div className="mt-auto flex items-center justify-between gap-3">
                  <Link
                    href={`/partners/${partnerId}`}
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                  >
                    {t("card.viewProfile")}
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  {partner.contact_email && (
                    <a
                      href={`mailto:${partner.contact_email}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 underline-offset-2 hover:text-emerald-900 hover:underline"
                    >
                      <Mail className="h-4 w-4" />
                      {t("card.contactCta")}
                    </a>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </div>

      <section className="mx-auto max-w-6xl mt-10 rounded-2xl bg-emerald-50 px-6 py-5 flex flex-col gap-3 items-start justify-between md:flex-row md:items-center">
        <div>
          <h3 className="text-base font-semibold text-emerald-900">{t("cta.title")}</h3>
          <p className="text-sm text-emerald-800">{t("cta.body")}</p>
        </div>
        <Link
          href="/dashboard"
          className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
        >
          {t("cta.button")}
        </Link>
      </section>
    </div>
  )
}
