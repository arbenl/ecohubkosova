"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, Mail, ExternalLink } from "lucide-react"

interface ContactCardV2Props {
    email: string | null
    organizationName?: string | null
    listingTitle?: string
    listingUrl?: string
    contactCount?: number
    onContactInteraction?: () => void
}

export function ContactCardV2({
    email,
    organizationName,
    listingTitle,
    listingUrl,
    contactCount,
    onContactInteraction
}: ContactCardV2Props) {
    const t = useTranslations("marketplace-v2")
    const [revealed, setRevealed] = useState(false)
    const [copied, setCopied] = useState(false)

    const handleReveal = () => {
        setRevealed(true)
        // Track CONTACT interaction
        if (onContactInteraction) {
            onContactInteraction()
        }
    }

    const handleCopy = async () => {
        if (!email) return
        await navigator.clipboard.writeText(email)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
    }

    // Generate mailto link with template
    const generateMailtoLink = () => {
        if (!email) return "#"

        const subject = encodeURIComponent("EcoHub Kosova – Interest in your listing")
        const body = encodeURIComponent(
            `Hello,

I found your listing "${listingTitle || "listing"}" on EcoHub Kosova circular marketplace and I'm interested in learning more.

Listing: ${listingUrl || window.location.href}

I found your listing on EcoHub Kosova circular marketplace.

Best regards`
        )

        return `mailto:${email}?subject=${subject}&body=${body}`
    }

    return (
        <Card className="border-green-100 bg-green-50/60">
            <CardHeader>
                <CardTitle className="text-lg text-green-900">
                    {t("contact.title")}
                </CardTitle>
                {organizationName && (
                    <p className="text-sm text-muted-foreground">
                        {t("contact.organization", { name: organizationName })}
                    </p>
                )}
            </CardHeader>
            <CardContent className="space-y-3">
                {contactCount && contactCount > 0 && (
                    <p className="text-xs text-muted-foreground">
                        {t("contact.contactCount", { count: contactCount })}
                    </p>
                )}

                {!revealed ? (
                    <Button
                        type="button"
                        variant="default"
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                        onClick={handleReveal}
                        disabled={!email}
                    >
                        <Mail className="h-4 w-4 mr-2" />
                        {t("contact.reveal")}
                    </Button>
                ) : email ? (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between rounded-md border border-green-200 bg-white px-3 py-2">
                            <div className="flex items-center gap-2 text-sm">
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                    <Mail className="h-4 w-4" />
                                </Badge>
                                <span className="font-medium text-gray-900">{email}</span>
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
                            {copied && (
                                <span className="text-xs text-green-700 ml-2">{t("contact.copied")}</span>
                            )}
                        </div>

                        <Button
                            variant="outline"
                            className="w-full border-green-200 text-green-700 hover:bg-green-50"
                            asChild
                        >
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
                    <p className="text-sm text-muted-foreground">
                        {t("contact.unavailable")}
                    </p>
                )}
                <p className="text-xs text-muted-foreground">
                    {t("contact.disclaimer")}
                </p>
            </CardContent>
        </Card>
    )
}
