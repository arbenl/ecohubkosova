"use client"

import { useTransition } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft } from "lucide-react"
import { createOrganizationAction } from "./actions"
import { organizationOnboardingSchema } from "@/validation/organization"
import type { OrganizationOnboardingInput } from "@/validation/organization"

interface CreateOrganizationFormProps {
  locale: string
  userId: string
  onBack: () => void
}

export default function CreateOrganizationForm({
  locale,
  userId,
  onBack,
}: CreateOrganizationFormProps) {
  const t = useTranslations("my-organization")
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrganizationOnboardingInput>({
    resolver: zodResolver(organizationOnboardingSchema),
  })

  const onSubmit = (data: OrganizationOnboardingInput) => {
    startTransition(async () => {
      const result = await createOrganizationAction(data, locale)

      if (result.error) {
        alert(result.error)
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
        {t("create.form.cancel")}
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t("create.title")}</h1>
        <p className="mt-2 text-gray-600">{t("create.subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-lg border border-gray-200 bg-white p-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">{t("create.form.name")}</label>
          <input
            {...register("name")}
            type="text"
            placeholder={t("create.form.namePlaceholder")}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{String(errors.name.message)}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">{t("create.form.description")}</label>
          <textarea
            {...register("description")}
            placeholder={t("create.form.descriptionPlaceholder")}
            rows={4}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-500">{String(errors.description.message)}</p>
          )}
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700">{t("create.form.type")}</label>
          <select
            {...register("type")}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="">{t("create.form.typePlaceholder")}</option>
            <option value="OJQ">{t("create.form.typeOJQ")}</option>
            <option value="Ndërmarrje Sociale">{t("create.form.typeCompany")}</option>
            <option value="Kompani">{t("create.form.typeEnterprise")}</option>
          </select>
          {errors.type && <p className="mt-1 text-sm text-red-500">{String(errors.type.message)}</p>}
        </div>

        {/* Primary Interest */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t("create.form.primaryInterest")}
          </label>
          <input
            {...register("primary_interest")}
            type="text"
            placeholder={t("create.form.primaryInterestPlaceholder")}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          {errors.primary_interest && (
            <p className="mt-1 text-sm text-red-500">{String(errors.primary_interest.message)}</p>
          )}
        </div>

        {/* Contact Person */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t("create.form.contactPerson")}
          </label>
          <input
            {...register("contact_person")}
            type="text"
            placeholder={t("create.form.contactPersonPlaceholder")}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          {errors.contact_person && (
            <p className="mt-1 text-sm text-red-500">{String(errors.contact_person.message)}</p>
          )}
        </div>

        {/* Contact Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t("create.form.contactEmail")}
          </label>
          <input
            {...register("contact_email")}
            type="email"
            placeholder={t("create.form.contactEmailPlaceholder")}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          {errors.contact_email && (
            <p className="mt-1 text-sm text-red-500">{String(errors.contact_email.message)}</p>
          )}
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700">{t("create.form.location")}</label>
          <input
            {...register("location")}
            type="text"
            placeholder={t("create.form.locationPlaceholder")}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          {errors.location && <p className="mt-1 text-sm text-red-500">{String(errors.location.message)}</p>}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onBack}
            disabled={isPending}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 hover:bg-gray-50 disabled:opacity-50"
          >
            {t("create.form.cancel")}
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {isPending ? t("create.form.submit") : t("create.form.submit")}
          </button>
        </div>
      </form>
    </div>
  )
}
