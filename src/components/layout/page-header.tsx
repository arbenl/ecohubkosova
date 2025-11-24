import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  subtitle?: string
  children?: React.ReactNode // For actions like "Add Listing"
  className?: string
}

export function PageHeader({ title, subtitle, children, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200",
        className
      )}
    >
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold text-green-900">{title}</h1>
            {subtitle && <p className="text-lg text-green-700">{subtitle}</p>}
          </div>
          {children && <div className="flex-shrink-0">{children}</div>}
        </div>
      </div>
    </div>
  )
}
