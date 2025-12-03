"use client"

import { Link } from "@/i18n/routing"
import { usePathname } from "next/navigation"
import { useLocale } from "next-intl"
import { cn } from "@/lib/utils"

const knowledgeLinks = [{ href: "/knowledge", label: "Qendra e Dijes" }]

export function KnowledgeSidebar() {
  const pathname = usePathname()
  const locale = useLocale()

  return (
    <nav className="space-y-2">
      {knowledgeLinks.map((link) => {
        const href = link.href
        const isActive = pathname === href
        return (
          <Link
            key={link.href}
            href={href}
            className={cn(
              "block px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
              isActive ? "bg-[#00C896] text-white" : "text-gray-700 hover:bg-gray-100"
            )}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
