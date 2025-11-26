import { Users, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"

interface UsersEmptyStateProps {
  hasFilters: boolean
  onClearFilters: () => void
  t: any
}

export function UsersEmptyState({ hasFilters, onClearFilters, t }: UsersEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white px-8 py-12 text-center">
      <div className="mb-4 rounded-full bg-emerald-50 p-3">
        {hasFilters ? (
          <Search className="h-8 w-8 text-emerald-600" />
        ) : (
          <Users className="h-8 w-8 text-emerald-600" />
        )}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900">
        {hasFilters ? t("users.empty.filtered.title") : t("users.empty.noUsers.title")}
      </h3>
      <p className="mb-6 text-gray-600">
        {hasFilters ? t("users.empty.filtered.description") : t("users.empty.noUsers.description")}
      </p>
      {hasFilters && (
        <Button onClick={onClearFilters} variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          {t("users.empty.clearFilters")}
        </Button>
      )}
    </div>
  )
}
