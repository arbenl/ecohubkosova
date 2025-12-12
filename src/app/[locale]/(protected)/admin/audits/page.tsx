import { getTranslations } from "next-intl/server"
import { getAuditLogs } from "./actions"
import AuditsClientPage from "./audits-client-page"

export default async function AuditsPage() {
  const t = await getTranslations("admin-workspace.audits")
  const { data: auditLogs, total, error } = await getAuditLogs(50, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <AuditsClientPage initialLogs={auditLogs ?? []} totalCount={total} error={error} />
    </div>
  )
}
