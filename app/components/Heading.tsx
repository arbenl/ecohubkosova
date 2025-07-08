"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export interface HeadingProps {
  /** Kryetitulli kryesor / Main title */
  title: string
  /** Nëntitulli opsional / Optional subtitle */
  subtitle?: ReactNode
  /** Qendro tekstin / Center-align text */
  center?: boolean
  className?: string
}

/**
 * Komponent i thjeshtë për tituj faqesh apo seksionesh.
 */
export function Heading({ title, subtitle, center = false, className }: HeadingProps) {
  return (
    <div className={cn(center ? "text-center" : "text-start", className)}>
      <h2 className="scroll-m-20 text-2xl font-bold tracking-tight lg:text-3xl">{title}</h2>

      {subtitle ? <p className="mt-1 text-muted-foreground">{subtitle}</p> : null}
    </div>
  )
}
