"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Plus, Search } from "lucide-react"
import CreateOrganizationForm from "./create-organization-form"
import ClaimOrganizationForm from "./claim-organization-form"

interface OrganizationOnboardingProps {
  locale: string
  userId: string
}

type OnboardingStep = "choice" | "create" | "claim"

export default function OrganizationOnboarding({ locale, userId }: OrganizationOnboardingProps) {
  const t = useTranslations("my-organization")
  const [step, setStep] = useState<OnboardingStep>("choice")

  if (step === "create") {
    return <CreateOrganizationForm locale={locale} userId={userId} onBack={() => setStep("choice")} />
  }

  if (step === "claim") {
    return <ClaimOrganizationForm locale={locale} userId={userId} onBack={() => setStep("choice")} />
  }

  // Choice step
  return (
    <div className="mx-auto max-w-2xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">{t("onboarding.title")}</h1>
        <p className="mt-2 text-gray-600">{t("onboarding.noOrgDescription")}</p>
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => setStep("create")}
            className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            {t("onboarding.startRegistration")}
          </button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Create New Organization */}
        <button
          onClick={() => setStep("create")}
          className="flex flex-col items-start gap-4 rounded-lg border border-gray-300 bg-white p-6 hover:border-emerald-500 hover:shadow-lg transition"
        >
          <div className="rounded-lg bg-emerald-100 p-3">
            <Plus className="h-6 w-6 text-emerald-600" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">{t("onboarding.createNew")}</h3>
            <p className="mt-1 text-sm text-gray-600">{t("onboarding.createDescription")}</p>
          </div>
        </button>

        {/* Claim Existing Organization */}
        <button
          onClick={() => setStep("claim")}
          className="flex flex-col items-start gap-4 rounded-lg border border-gray-300 bg-white p-6 hover:border-blue-500 hover:shadow-lg transition"
        >
          <div className="rounded-lg bg-blue-100 p-3">
            <Search className="h-6 w-6 text-blue-600" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">{t("onboarding.searchExisting")}</h3>
            <p className="mt-1 text-sm text-gray-600">{t("onboarding.searchDescription")}</p>
          </div>
        </button>
      </div>
    </div>
  )
}
