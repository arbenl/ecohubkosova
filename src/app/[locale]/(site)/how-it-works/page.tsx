import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { PublicPageHero } from "@/components/layout/PublicPageHero"

export default async function HowItWorksPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations("how-it-works")

  const steps = [
    {
      title: t("steps.discover.title"),
      body: t("steps.discover.body"),
    },
    {
      title: t("steps.connect.title"),
      body: t("steps.connect.body"),
    },
    {
      title: t("steps.closeLoop.title"),
      body: t("steps.closeLoop.body"),
    },
  ]

  const audiences = [
    {
      title: t("audiences.business.title"),
      body: t("audiences.business.body"),
    },
    {
      title: t("audiences.ngo.title"),
      body: t("audiences.ngo.body"),
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-white to-white">
      <PublicPageHero
        namespace="how-it-works"
        titleKey="pageTitle"
        subtitleKey="pageSubtitle"
        eyebrowKey=""
        variant="default"
        actions={
          <>
            <Link
              href={`/${locale}/marketplace`}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50"
            >
              {t("heroCtaPrimary")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={`/${locale}/partners`}
              className="inline-flex items-center gap-2 rounded-full border border-white/70 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {t("heroCtaSecondary")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </>
        }
      >
        <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
          <ul className="space-y-3 text-sm text-emerald-50">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-white" />
              {t("steps.discover.title")}
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-white" />
              {t("steps.connect.title")}
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-white" />
              {t("steps.closeLoop.title")}
            </li>
          </ul>
        </div>
      </PublicPageHero>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 md:py-14">
        <div className="mb-8 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">
            {t("stepsTitle")}
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
            {t("stepsTitle")}
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step) => (
            <article
              key={step.title}
              className="flex flex-col gap-3 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 font-semibold">
                <ArrowRight className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
              <p className="text-sm text-slate-600">{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 md:py-14">
        <div className="mb-8 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">
            {t("audiencesTitle")}
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
            {t("audiencesTitle")}
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {audiences.map((audience) => (
            <article
              key={audience.title}
              className="flex h-full flex-col gap-3 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                {audience.title}
              </div>
              <p className="text-sm text-slate-700">{audience.body}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
