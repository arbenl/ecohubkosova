"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Eye, Mail, Bookmark, Share2, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { OrganizationAnalytics } from "@/services/analytics"

interface AnalyticsTabProps {
  organizationId: string
  analytics: OrganizationAnalytics | null
  isLoading: boolean
  onTimeRangeChange: (range: "last30Days" | "last90Days" | "allTime") => void
  selectedTimeRange: "last30Days" | "last90Days" | "allTime"
}

const StatCard = ({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: React.ReactNode
  label: string
  value: number
  description: string
}) => (
  <Card className="border-green-100 bg-green-50">
    <CardContent className="pt-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="mt-2 text-3xl font-bold text-green-700">{value.toLocaleString()}</p>
          <p className="mt-1 text-xs text-gray-500">{description}</p>
        </div>
        <div className="text-green-600 opacity-20">{Icon}</div>
      </div>
    </CardContent>
  </Card>
)

export default function AnalyticsTab({
  organizationId,
  analytics,
  isLoading,
  onTimeRangeChange,
  selectedTimeRange,
}: AnalyticsTabProps) {
  const t = useTranslations("my-organization")

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-green-200 border-t-green-600"></div>
              <p className="text-gray-600">Loading analytics...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // No data available
  if (!analytics || analytics.listings.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <TrendingUp className="mb-4 h-12 w-12 text-gray-300" />
            <h3 className="font-semibold text-gray-900">{t("analytics.empty.title")}</h3>
            <p className="mt-2 text-sm text-gray-600">{t("analytics.empty.description")}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* Time Range Selector */}
      <div className="flex items-center gap-4">
        <label className="font-medium text-gray-700">{t("analytics.range.label")}:</label>
        <div className="flex gap-2">
          {[
            { value: "last30Days" as const, label: t("analytics.range.last30Days") },
            { value: "last90Days" as const, label: t("analytics.range.last90Days") },
            { value: "allTime" as const, label: t("analytics.range.allTime") },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onTimeRangeChange(value)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                selectedTimeRange === value
                  ? "bg-green-600 text-white"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">{t("analytics.summary.title")}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Eye className="h-8 w-8" />}
            label={t("analytics.summary.views")}
            value={analytics.totals.views}
            description={t("analytics.summary.viewsDescription")}
          />
          <StatCard
            icon={<Mail className="h-8 w-8" />}
            label={t("analytics.summary.contacts")}
            value={analytics.totals.contacts}
            description={t("analytics.summary.contactsDescription")}
          />
          <StatCard
            icon={<Bookmark className="h-8 w-8" />}
            label={t("analytics.summary.saves")}
            value={analytics.totals.saves}
            description={t("analytics.summary.savesDescription")}
          />
          <StatCard
            icon={<Share2 className="h-8 w-8" />}
            label={t("analytics.summary.shares")}
            value={analytics.totals.shares}
            description={t("analytics.summary.sharesDescription")}
          />
        </div>
      </div>

      {/* Listings Performance Table */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">{t("analytics.listings.title")}</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">
                      {t("analytics.listings.table.name")}
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">
                      {t("analytics.listings.table.status")}
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-gray-700">
                      {t("analytics.listings.table.views")}
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-gray-700">
                      {t("analytics.listings.table.contacts")}
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-gray-700">
                      {t("analytics.listings.table.saves")}
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-gray-700">
                      {t("analytics.listings.table.shares")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {analytics.listings.map((listing) => (
                    <tr key={listing.listingId} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{listing.listingTitle}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                            listing.listingStatus === "PUBLISHED"
                              ? "bg-green-100 text-green-800"
                              : listing.listingStatus === "DRAFT"
                                ? "bg-gray-100 text-gray-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {listing.listingStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-900">
                        {listing.totalViews.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-900">
                        {listing.totalContacts.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-900">
                        {listing.totalSaves.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-900">
                        {listing.totalShares.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
