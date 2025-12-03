"use client"

import { useState, useEffect } from "react"
import { Link } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { BookmarkIcon, Plus } from "lucide-react"
import type { UserOrganization } from "@/services/organization-onboarding"
import type { OrganizationAnalytics } from "@/services/analytics"
import { fetchOrganizationAnalyticsAction } from "./analytics-actions"
import OrganizationProfile from "./organization-profile"
import OrganizationOnboarding from "./organization-onboarding"
import AnalyticsTab from "./analytics-tab"
import MembersTab from "./members-tab"

import { WorkspaceLayout } from "@/components/workspace/workspace-layout"

interface MyOrganizationClientProps {
  locale: string
  initialOrganizations: UserOrganization[]
  userId: string
  error?: string
  listingCounts?: Record<string, number>
  listingSummaries?: Record<
    string,
    { id: string; title: string; status: string | null; city: string | null }[]
  >
}

export default function MyOrganizationClient({
  locale,
  initialOrganizations,
  userId,
  error,
  listingCounts,
  listingSummaries,
}: MyOrganizationClientProps) {
  const t = useTranslations("my-organization")
  const [organizations, setOrganizations] = useState(initialOrganizations)
  const [activeOrgId, setActiveOrgId] = useState<string | null>(initialOrganizations[0]?.id || null)
  const [activeTab, setActiveTab] = useState<"profile" | "analytics" | "members">("profile")
  const [analytics, setAnalytics] = useState<OrganizationAnalytics | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [selectedTimeRange, setSelectedTimeRange] = useState<
    "last30Days" | "last90Days" | "allTime"
  >("last30Days")

  useEffect(() => {
    if (initialOrganizations.length > 0 && !activeOrgId) {
      setActiveOrgId(initialOrganizations[0].id)
    }
  }, [initialOrganizations, activeOrgId])

  // Load analytics when organization or time range changes
  useEffect(() => {
    if (activeOrgId && activeTab === "analytics") {
      loadAnalytics()
    }
  }, [activeOrgId, activeTab, selectedTimeRange])

  const loadAnalytics = async () => {
    if (!activeOrgId) return

    setAnalyticsLoading(true)
    try {
      const { data } = await fetchOrganizationAnalyticsAction(activeOrgId, selectedTimeRange)
      setAnalytics(data)
    } catch (err) {
      console.error("Failed to load analytics:", err)
    } finally {
      setAnalyticsLoading(false)
    }
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">{error}</div>
    )
  }

  // No organizations - show onboarding
  if (organizations.length === 0) {
    return <OrganizationOnboarding locale={locale} userId={userId} />
  }

  // Single organization - show profile directly
  if (organizations.length === 1) {
    const org = organizations[0]
    const listings = listingSummaries?.[org.id] || []

    return (
      <WorkspaceLayout
        badge={t("workspace.title")}
        title={org.name}
        subtitle=""
        actions={
          <Link
            href="/marketplace/add"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
          >
            <Plus className="h-5 w-5" />
            {t("workspace.actions.createListing")}
          </Link>
        }
      >
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === "profile"
                  ? "border-b-2 border-emerald-600 text-emerald-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {t("workspace.section.profile")}
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === "analytics"
                  ? "border-b-2 border-emerald-600 text-emerald-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {t("analytics.tabs.analytics")}
            </button>
            <button
              onClick={() => setActiveTab("members")}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === "members"
                  ? "border-b-2 border-emerald-600 text-emerald-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {t("members.tabs.members")}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "profile" && (
          <OrganizationProfile locale={locale} organization={org} listings={listings} />
        )}
        {activeTab === "analytics" && (
          <AnalyticsTab
            organizationId={org.id}
            analytics={analytics}
            isLoading={analyticsLoading}
            onTimeRangeChange={setSelectedTimeRange}
            selectedTimeRange={selectedTimeRange}
          />
        )}
        {activeTab === "members" && (
          <MembersTab organizationId={org.id} userRole={org.role_in_organization} />
        )}
      </WorkspaceLayout>
    )
  }

  // Multiple organizations - show selector
  const activeOrg = organizations.find((o) => o.id === activeOrgId)
  const activeListings = activeOrgId ? listingSummaries?.[activeOrgId] || [] : []

  return (
    <WorkspaceLayout
      badge={t("workspace.title")}
      title={t("onboarding.subtitle")}
      subtitle=""
      actions={
        <Link
          href="/marketplace/add"
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
        >
          <Plus className="h-5 w-5" />
          {t("workspace.actions.createListing")}
        </Link>
      }
    >
      {/* Organization Switcher */}
      <div className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 p-4">
        <label htmlFor="org-select" className="font-medium text-gray-700">
          {t("workspace.switchOrganization")}:
        </label>
        <select
          id="org-select"
          value={activeOrgId || ""}
          onChange={(e) => {
            setActiveOrgId(e.target.value)
            setActiveTab("profile")
          }}
          className="rounded border border-gray-300 px-3 py-2 text-gray-900"
        >
          {organizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name} ({org.type})
            </option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      {activeOrg && (
        <div className="border-b border-gray-200">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === "profile"
                  ? "border-b-2 border-emerald-600 text-emerald-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {t("workspace.section.profile")}
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === "analytics"
                  ? "border-b-2 border-emerald-600 text-emerald-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {t("analytics.tabs.analytics")}
            </button>
            <button
              onClick={() => setActiveTab("members")}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === "members"
                  ? "border-b-2 border-emerald-600 text-emerald-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {t("members.tabs.members")}
            </button>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeOrg && activeTab === "profile" && (
        <OrganizationProfile locale={locale} organization={activeOrg} listings={activeListings} />
      )}
      {activeOrg && activeTab === "analytics" && (
        <AnalyticsTab
          organizationId={activeOrg.id}
          analytics={analytics}
          isLoading={analyticsLoading}
          onTimeRangeChange={setSelectedTimeRange}
          selectedTimeRange={selectedTimeRange}
        />
      )}
      {activeOrg && activeTab === "members" && (
        <MembersTab organizationId={activeOrg.id} userRole={activeOrg.role_in_organization} />
      )}
    </WorkspaceLayout>
  )
}
