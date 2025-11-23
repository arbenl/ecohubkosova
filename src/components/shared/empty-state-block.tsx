import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmptyStateBlockProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  className?: string
}

export function EmptyStateBlock({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  className,
}: EmptyStateBlockProps) {
  return (
    <Card className={cn("border-0 shadow-lg", className)}>
      <CardHeader className="text-center py-12">
        <div className="mb-4">
          <Icon className="h-16 w-16 text-gray-300 mx-auto" />
        </div>
        <CardTitle className="text-2xl mb-2">{title}</CardTitle>
        <CardDescription className="text-base mb-6">{description}</CardDescription>
        {actionLabel && actionHref && (
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        )}
      </CardHeader>
    </Card>
  )
}
