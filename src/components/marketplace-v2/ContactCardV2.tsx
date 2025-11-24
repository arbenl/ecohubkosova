"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, Mail, ExternalLink } from "lucide-react"
import type { Listing } from "@/types"

interface ContactCardV2Props {
  listing: Listing
  listingUrl?: string
  contactCount?: number
  onContactInteraction?: () => void
}

export function ContactCardV2({ listing, listingUrl, contactCount, onContactInteraction }: ContactCardV2Props) {
  const t = useTranslations("marketplace-v2")
  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied] = useState(false)

  const orgName = listing.organization_name ?? listing.organizations?.name ?? null
  const orgEmail = listing.organization_contact_email ?? listing.organizations?.contact_email ?? null
  const orgPhone = listing.organization_contact_phone ?? null
  const orgWebsite = listing.organization_contact_website ?? null
  const orgContactPerson = listing.organization_contact_person ?? null

  const creatorName = listing.creator_full_name ?? listing.users?.full_name ?? null
  const creatorEmail = listing.creator_email ?? listing.users?.email ?? null

  const hasOrgContact = Boolean(orgEmail || orgPhone || orgWebsite)
  const hasCreatorContact = Boolean(creatorEmail)

  const anonymousLabel = t("contact.anonymousLabel")
  const displayName = hasOrgContact
    ? orgName ?? t("contact.orgFallbackName")
    : hasCreatorContact
      ? creatorName ?? t("contact.creatorFallbackName")
      : anonymousLabel

  const displayEmail = hasOrgContact
    ? orgEmail
    : hasCreatorContact
      ? creatorEmail
      : null

  const handleReveal = () => {
    setRevealed(true)
    if (onContactInteraction) {
      onContactInteraction()
    }
  }

  const handleCopy = async () => {
    if (!displayEmail) return
    await navigator.clipboard.writeText(displayEmail)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const generateMailtoLink = () => {
    if (!displayEmail) return "#"

    const subject = encodeURIComponent("EcoHub Kosova – Interest in your listing")
    const body = encodeURIComponent(
      `Hello,\n\nI found your listing "${listing.title}" on EcoHub Kosova circular marketplace and I'm interested in learning more.\n\nListing: ${
        listingUrl || window.location.href
      }\n\nI found your listing on EcoHub Kosova circular marketplace.\n\nBest regards`
    )

    return `mailto:${displayEmail}?subject=${subject}&body=${body}`
  }

  return (
    <Card className="border-green-100 bg-green-50/60">
      <CardHeader>
        <CardTitle className="text-lg text-green-900">{t("contact.title")}</CardTitle>
        <p className="text-sm text-muted-foreground">{displayName}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {contactCount && contactCount > 0 && (
          <p className="text-xs text-muted-foreground">{t("contact.contactCount", { count: contactCount })}</p>
        )}

        {orgContactPerson && (
          <p className="text-sm text-muted-foreground">
            {t("contact.contactPersonLabel")}: {orgContactPerson}
          </p>
        )}
        {orgPhone && (
          <p className="text-sm text-muted-foreground">
            {t("contact.phoneLabel")}: {orgPhone}
          </p>
        )}
        {orgWebsite && (
          <a
            href={orgWebsite}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-emerald-700 hover:underline"
          >
            {t("contact.websiteLabel")}
          </a>
        )}

        {!revealed ? (
          <Button
            type="button"
            variant="default"
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            onClick={handleReveal}
            disabled={!displayEmail}
          >
            <Mail className="h-4 w-4 mr-2" />
            {t("contact.reveal")}
          </Button>
        ) : displayEmail ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-md border border-green-200 bg-white px-3 py-2">
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Mail className="h-4 w-4" />
                </Badge>
                <span className="font-medium text-gray-900">{displayEmail}</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                aria-label={t("contact.copy")}
              >
                <Copy className="h-4 w-4" />
                <span className="sr-only">{t("contact.copy")}</span>
              </Button>
              {copied && <span className="text-xs text-green-700 ml-2">{t("contact.copied")}</span>}
            </div>

            <Button variant="outline" className="w-full border-green-200 text-green-700 hover:bg-green-50" asChild>
              <a
                href={generateMailtoLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                {t("contact.sendEmail")}
              </a>
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t("contact.unavailable")}</p>
        )}
        <p className="text-xs text-muted-foreground">{t("contact.disclaimer")}</p>
      </CardContent>
    </Card>
  )
}
