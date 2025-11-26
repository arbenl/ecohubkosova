import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface UsersErrorStateProps {
  error: string
  onRetry: () => void
  t: any
}

export function UsersErrorState({ error, onRetry, t }: UsersErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-8 py-12 text-center">
      <div className="mb-4 rounded-full bg-red-100 p-3">
        <AlertTriangle className="h-8 w-8 text-red-600" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-red-900">{t("users.error.title")}</h3>
      <p className="mb-6 text-red-700">{error}</p>
      <Button
        onClick={onRetry}
        variant="outline"
        className="border-red-300 text-red-700 hover:bg-red-100"
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        {t("users.error.retry")}
      </Button>
    </div>
  )
}
