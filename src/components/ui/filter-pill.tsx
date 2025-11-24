import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export interface FilterPillProps {
    label: string
    icon?: React.ReactNode
    onClick?: () => void
    href?: string
    variant?: "emerald" | "blue" | "purple" | "orange" | "teal" | "slate"
    size?: "sm" | "md"
    className?: string
}

const variantStyles = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300",
    blue: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-300",
    purple: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 hover:border-purple-300",
    orange: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 hover:border-orange-300",
    teal: "bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100 hover:border-teal-300",
    slate: "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300",
}

const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-3 py-1 text-xs",
}

export function FilterPill({
    label,
    icon,
    onClick,
    href,
    variant = "emerald",
    size = "md",
    className,
}: FilterPillProps) {
    const baseStyles = "inline-flex items-center gap-1 rounded-full border font-medium transition-colors cursor-pointer"
    const combinedStyles = cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
    )

    if (href) {
        return (
            <Link href={href} className={combinedStyles}>
                {icon}
                {label}
            </Link>
        )
    }

    if (onClick) {
        return (
            <button type="button" onClick={onClick} className={combinedStyles}>
                {icon}
                {label}
            </button>
        )
    }

    // Fallback: non-interactive pill
    return (
        <span className={cn(baseStyles, variantStyles[variant], sizeStyles[size], "cursor-default", className)}>
            {icon}
            {label}
        </span>
    )
}
