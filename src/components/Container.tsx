"use client"

import type { ReactNode } from "react"
import { cn } from "../lib/utils"

export interface ContainerProps {
  children: ReactNode
  /** Klasa shtesë opsionale / Optional extra class */
  className?: string
  /** Gjerësia maksimale / Maximum width (default: 7xl) */
  maxWidthClass?: string
}

/**
 * Mbështjellës i përgjithshëm për vendosje margjinash & gjerësi maksimale.
 */
export function Container({ children, className, maxWidthClass = "max-w-7xl" }: ContainerProps) {
  return <div className={cn("mx-auto px-4 md:px-8", maxWidthClass, className)}>{children}</div>
}
