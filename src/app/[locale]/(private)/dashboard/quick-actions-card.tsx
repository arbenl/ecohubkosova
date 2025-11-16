"use client"

import Link from "next/link"
import { ShoppingCart, Users, BookOpen, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const QUICK_ACTIONS = [
  {
    title: "Shto listim në treg",
    description: "Publiko një listim të ri",
    href: "/marketplace/shto",
    Icon: ShoppingCart,
  },
  {
    title: "Eksploro partnerët",
    description: "Zbuloni organizatat partnere",
    href: "/drejtoria",
    Icon: Users,
  },
  {
    title: "Qendra e dijes",
    description: "Lexo artikujt e fundit",
    href: "/knowledge",
    Icon: BookOpen,
  },
  {
    title: "Përditëso profilin",
    description: "Rregullo informacionet tuaja",
    href: "/profile",
    Icon: User,
  },
] as const

export function QuickActionsCard() {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-gray-900">Veprime të shpejta</CardTitle>
        <CardDescription>Akseso funksionalitetet kryesore të platformës</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {QUICK_ACTIONS.map(({ title, description, href, Icon }) => (
            <Button
              key={href}
              variant="outline"
              className="h-auto py-6 flex flex-col items-center justify-center gap-3 rounded-xl hover-lift bg-transparent"
              asChild
            >
              <Link href={href}>
                <Icon className="h-8 w-8 text-emerald-600" />
                <span className="text-sm font-medium text-center">{title}</span>
                <span className="text-xs text-gray-500 text-center">{description}</span>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
