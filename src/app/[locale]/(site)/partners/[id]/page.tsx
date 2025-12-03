import { Link } from "@/i18n/routing"
import { getTranslations } from "next-intl/server"
import clsx from "clsx"
import { ArrowLeft, ArrowUpRight, Globe, Mail, MapPin, Phone, ShieldCheck } from "lucide-react"

import { fetchPartnerById } from "@/services/partners"

interface PageProps {
  params: Promise<{ locale: string; id: string }>
}

export default async function PartnerDetailPage({ params }: PageProps) {
  const { locale, id } = await params
  const t = await getTranslations("partners")

  const partner = await fetchPartnerById(id)

  if (!partner) {
    console.error(`[PartnerDetail] Partner not found for ID: ${id}`)
    return (
      <div className="min-h-[60vh] bg-gradient-to-b from-emerald-50 to-white">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-xs font-semibold text-emerald-800">
            <ShieldCheck className="h-4 w-4" /> EcoHub Partners
          </div>
          <h1 className="text-3xl font-bold text-slate-900">{t("detail.notFoundTitle")}</h1>
          <p className="text-slate-600">{t("detail.notFoundBody")}</p>
          {process.env.NODE_ENV === "development" && (
            <p className="text-xs text-gray-500 font-mono">Debug: Searched for ID {id}</p>
          )}
          <div className="mt-4 flex justify-center">
            <Link
              href="/partners"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("detail.backToPartners")}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const roleLabel = partner.org_role
    ? (() => {
        try {
          return t(`card.roleLabels.${partner.org_role}`)
        } catch {
          return partner.org_role
        }
      })()
    : null

  const mailSubject = encodeURIComponent(`Partneritet EcoHub – ${partner.name}`)
  const mailHref = partner.contact_email
    ? `mailto:${partner.contact_email}?subject=${mailSubject}`
    : undefined

  const phoneHref = partner.contact_phone ? `tel:${partner.contact_phone}` : undefined

  const websiteHref =
    partner.website && partner.website.startsWith("http")
      ? partner.website
      : partner.website
        ? `https://${partner.website}`
        : undefined
  const sector =
    (partner.metadata as Record<string, unknown> | undefined)?.sector ??
    partner.primary_interest ??
    null

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-white to-white">
      <section className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-100">
              EcoHub Partners
              {partner.verification_status === "VERIFIED" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold text-white">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {t("detail.verifiedBadge")}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-start gap-4 justify-between">
              <div className="space-y-3">
                <h1 className="text-3xl font-bold md:text-4xl">{partner.name}</h1>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  {roleLabel && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white">
                      {roleLabel}
                    </span>
                  )}
                  {partner.location && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-black/10 px-3 py-1 text-xs font-semibold text-white">
                      <MapPin className="h-4 w-4" />
                      {partner.location}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/partners"
                  className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/25"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t("detail.backToPartners")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[2fr_1fr] lg:px-8">
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-emerald-50">
            <h2 className="text-lg font-semibold text-slate-900">{t("detail.aboutTitle")}</h2>
            <p className="mt-3 text-slate-700 leading-relaxed">
              {partner.description || t("page.subtitle")}
            </p>
            {sector && (
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-800">
                  {sector as string}
                </span>
                {partner.primary_interest && (
                  <span className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1 font-semibold text-sky-800">
                    {partner.primary_interest}
                  </span>
                )}
              </div>
            )}
          </div>

          {(partner.waste_types_handled?.length || partner.service_areas?.length) && (
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-emerald-50">
              <div className="space-y-4">
                {partner.waste_types_handled?.length ? (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      {t("detail.servicesTitle")}
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {partner.waste_types_handled.map((item) => (
                        <span
                          key={item}
                          className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {partner.service_areas?.length ? (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      {t("detail.areasTitle")}
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {partner.service_areas.map((area) => (
                        <span
                          key={area}
                          className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-emerald-50">
            <h3 className="text-sm font-semibold text-slate-900">{t("detail.contactTitle")}</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              {partner.contact_person && (
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span>{partner.contact_person}</span>
                </div>
              )}
              {partner.contact_email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-emerald-500" />
                  <a
                    href={`mailto:${partner.contact_email}`}
                    className="text-emerald-700 hover:underline"
                  >
                    {partner.contact_email}
                  </a>
                </div>
              )}
              {partner.contact_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-emerald-500" />
                  <a href={phoneHref} className="text-emerald-700 hover:underline">
                    {partner.contact_phone}
                  </a>
                </div>
              )}
              {websiteHref && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-emerald-500" />
                  <a
                    href={websiteHref}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-700 hover:underline"
                  >
                    {partner.website}
                  </a>
                </div>
              )}
            </div>
            {mailHref && (
              <div className="mt-4">
                <a
                  href={mailHref}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                >
                  {t("card.contactCta")}
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
