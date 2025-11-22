"use client"

import { useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { Building2, Mail, MapPin, Edit2, ExternalLink } from "lucide-react"
import type { UserOrganization } from "@/services/organization-onboarding"

interface OrganizationProfileProps {
  locale: string
  organization: UserOrganization
}

export default function OrganizationProfile({ locale, organization }: OrganizationProfileProps) {
  const t = useTranslations("my-organization")

  const roleLabel = {
    admin: t("workspace.profile.memberRoleAdmin"),
    editor: t("workspace.profile.memberRoleEditor"),
    viewer: t("workspace.profile.memberRoleViewer"),
  }[organization.role_in_organization] || organization.role_in_organization

  const statusLabel = organization.is_approved
    ? t("workspace.profile.statusApproved")
    : t("workspace.profile.statusPending")

  return (
    <div className="space-y-6">
      {/* Profile Summary Card */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">{organization.name}</h2>
            <p className="text-gray-600">{organization.description}</p>
          </div>
          <div className="flex gap-2">
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
              {organization.type}
            </span>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                organization.is_approved
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {statusLabel}
            </span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <MapPin className="mt-1 h-5 w-5 flex-shrink-0 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500">{t("workspace.profile.location")}</p>
              <p className="text-gray-900">{organization.location}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Building2 className="mt-1 h-5 w-5 flex-shrink-0 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500">{t("workspace.profile.primaryInterest")}</p>
              <p className="text-gray-900">{organization.primary_interest}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-sm font-medium text-gray-500">{t("workspace.profile.contactPerson")}</span>
            <p className="text-gray-900">{organization.contact_person}</p>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="mt-1 h-5 w-5 flex-shrink-0 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500">{t("workspace.profile.contactEmail")}</p>
              <a href={`mailto:${organization.contact_email}`} className="text-emerald-600 hover:underline">
                {organization.contact_email}
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-sm font-medium text-gray-500">{t("workspace.profile.memberRole")}</span>
            <p className="text-gray-900">{roleLabel}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/${locale}/eco-organizations/${organization.id}`}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 hover:bg-gray-50"
          >
            <ExternalLink className="h-4 w-4" />
            {t("workspace.actions.viewPublicProfile")}
          </Link>

          <button
            onClick={() => {
              // TODO: Implement edit organization profile
              console.log("Edit profile for", organization.id)
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-emerald-700 hover:bg-emerald-100"
          >
            <Edit2 className="h-4 w-4" />
            {t("workspace.actions.editProfile")}
          </button>
        </div>
      </div>
    </div>
  )
}
