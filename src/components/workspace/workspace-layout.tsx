import React from "react"
import { Badge } from "@/components/ui/badge"

interface WorkspaceLayoutProps {
    title: string
    subtitle: string
    badge?: string
    actions?: React.ReactNode
    children: React.ReactNode
}

export function WorkspaceLayout({
    title,
    subtitle,
    badge,
    actions,
    children,
}: WorkspaceLayoutProps) {
    return (
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 md:py-8 lg:py-10 space-y-6 md:space-y-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-3 md:space-y-4">
                    {badge && (
                        <Badge variant="secondary" className="mb-1 md:mb-2">
                            {badge}
                        </Badge>
                    )}
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">{title}</h1>
                    {subtitle && <p className="text-muted-foreground text-base md:text-lg">{subtitle}</p>}
                </div>
                {actions && <div className="flex-shrink-0 w-full md:w-auto">{actions}</div>}
            </div>
            <div className="space-y-4 md:space-y-6">{children}</div>
        </div>
    )
}
