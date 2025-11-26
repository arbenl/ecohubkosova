import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface UsersHeaderProps {
  locale: string
  onRefresh: () => void
  isLoading: boolean
  t: any
}

export function UsersHeader({ locale, onRefresh, isLoading, t }: UsersHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{t("users.title")}</h1>
        <p className="text-gray-600">{t("users.subtitle")}</p>
      </div>
      <Button
        onClick={onRefresh}
        disabled={isLoading}
        variant="outline"
        className="w-full sm:w-auto"
      >
        <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        {t("users.refresh")}
      </Button>
    </div>
  )
}
