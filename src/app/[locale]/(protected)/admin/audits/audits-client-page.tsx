"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  CheckCircle2,
  XCircle,
  Trash2,
  Edit,
  UserCheck,
  UserX,
  FileText,
  Building2,
  Package,
  Shield,
  RefreshCw,
  Filter,
  Clock,
  Activity,
  History,
} from "lucide-react"
import type { AuditLogEntry } from "@/services/audit"
import { getAuditLogs } from "./actions"

interface AuditsClientPageProps {
  initialLogs: AuditLogEntry[]
  totalCount: number
  error: string | null
}

const actionIcons: Record<string, React.ReactNode> = {
  LISTING_APPROVED: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
  LISTING_REJECTED: <XCircle className="h-4 w-4 text-red-600" />,
  LISTING_DELETED: <Trash2 className="h-4 w-4 text-red-600" />,
  LISTING_UPDATED: <Edit className="h-4 w-4 text-blue-600" />,
  ORGANIZATION_APPROVED: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
  ORGANIZATION_REJECTED: <XCircle className="h-4 w-4 text-red-600" />,
  ORGANIZATION_DELETED: <Trash2 className="h-4 w-4 text-red-600" />,
  USER_APPROVED: <UserCheck className="h-4 w-4 text-emerald-600" />,
  USER_DELETED: <UserX className="h-4 w-4 text-red-600" />,
  USER_ROLE_CHANGED: <Shield className="h-4 w-4 text-purple-600" />,
  ARTICLE_PUBLISHED: <FileText className="h-4 w-4 text-emerald-600" />,
  ARTICLE_UNPUBLISHED: <FileText className="h-4 w-4 text-amber-600" />,
}

const entityIcons: Record<string, React.ReactNode> = {
  listing: <Package className="h-4 w-4" />,
  organization: <Building2 className="h-4 w-4" />,
  user: <UserCheck className="h-4 w-4" />,
  article: <FileText className="h-4 w-4" />,
  system: <Shield className="h-4 w-4" />,
}

const actionLabels: Record<string, string> = {
  LISTING_APPROVED: "Aprovoi Listimin",
  LISTING_REJECTED: "Refuzoi Listimin",
  LISTING_DELETED: "Fshiu Listimin",
  LISTING_UPDATED: "Përditësoi Listimin",
  ORGANIZATION_APPROVED: "Aprovoi Organizatën",
  ORGANIZATION_REJECTED: "Refuzoi Organizatën",
  ORGANIZATION_DELETED: "Fshiu Organizatën",
  USER_APPROVED: "Aprovoi Përdoruesin",
  USER_DELETED: "Fshiu Përdoruesin",
  USER_ROLE_CHANGED: "Ndryshoi Rolin",
  ARTICLE_PUBLISHED: "Publikoi Artikullin",
  ARTICLE_UNPUBLISHED: "Çpublikoi Artikullin",
}

const entityLabels: Record<string, string> = {
  listing: "Listim",
  organization: "Organizatë",
  user: "Përdorues",
  article: "Artikull",
  system: "Sistem",
}

const actionColors: Record<string, string> = {
  LISTING_APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  LISTING_REJECTED: "bg-red-50 text-red-700 border-red-200",
  LISTING_DELETED: "bg-red-50 text-red-700 border-red-200",
  LISTING_UPDATED: "bg-blue-50 text-blue-700 border-blue-200",
  ORGANIZATION_APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ORGANIZATION_REJECTED: "bg-red-50 text-red-700 border-red-200",
  ORGANIZATION_DELETED: "bg-red-50 text-red-700 border-red-200",
  USER_APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  USER_DELETED: "bg-red-50 text-red-700 border-red-200",
  USER_ROLE_CHANGED: "bg-purple-50 text-purple-700 border-purple-200",
  ARTICLE_PUBLISHED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ARTICLE_UNPUBLISHED: "bg-amber-50 text-amber-700 border-amber-200",
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("sq-AL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

function getRelativeTime(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Tani"
  if (diffMins < 60) return `${diffMins} min më parë`
  if (diffHours < 24) return `${diffHours} orë më parë`
  if (diffDays < 7) return `${diffDays} ditë më parë`
  return formatDate(dateString)
}

export default function AuditsClientPage({
  initialLogs,
  totalCount,
  error,
}: AuditsClientPageProps) {
  const t = useTranslations("admin-workspace.audits")
  const [logs, setLogs] = useState<AuditLogEntry[]>(initialLogs)
  const [isLoading, setIsLoading] = useState(false)
  const [entityFilter, setEntityFilter] = useState<string>("all")

  const filteredLogs =
    entityFilter === "all" ? logs : logs.filter((log) => log.entityType === entityFilter)

  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      const result = await getAuditLogs(50, 0)
      if (result.data) {
        setLogs(result.data)
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="py-10 text-center text-red-600">
          <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="font-medium">Gabim gjatë ngarkimit</p>
          <p className="text-sm mt-1">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-emerald-100">
                <Activity className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-700">{totalCount}</p>
                <p className="text-sm text-emerald-600">Gjithsej veprime</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-100">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-700">
                  {logs.filter((l) => l.entityType === "listing").length}
                </p>
                <p className="text-sm text-blue-600">Veprime në listime</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-100">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-700">
                  {logs.filter((l) => l.entityType === "organization").length}
                </p>
                <p className="text-sm text-purple-600">Veprime në organizata</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={entityFilter} onValueChange={setEntityFilter}>
            <SelectTrigger className="w-full sm:w-[180px] bg-white">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Filtro sipas tipit" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Të gjitha</SelectItem>
              <SelectItem value="listing">Listime</SelectItem>
              <SelectItem value="organization">Organizata</SelectItem>
              <SelectItem value="user">Përdorues</SelectItem>
              <SelectItem value="article">Artikuj</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
          className="bg-white"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Rifresko
        </Button>
      </div>

      {/* Audit Log Table */}
      <Card className="shadow-sm">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100">
              <History className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{t("cardTitle")}</CardTitle>
              <CardDescription>
                {filteredLogs.length > 0
                  ? `Duke shfaqur ${filteredLogs.length} nga ${totalCount} regjistrime`
                  : "Asnjë regjistrim ende"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredLogs.length === 0 ? (
            <div className="py-16 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("noRecords")}</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Veprimet administruese do të regjistrohen këtu automatikisht kur të aprovoni, fshini
                ose modifikoni listime dhe organizata.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[600px]">
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="w-[180px] font-semibold">Koha</TableHead>
                    <TableHead className="font-semibold">Veprimi</TableHead>
                    <TableHead className="font-semibold">Entiteti</TableHead>
                    <TableHead className="font-semibold">Aktori</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">
                            {getRelativeTime(log.createdAt)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(log.createdAt)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`gap-1.5 ${actionColors[log.action] || "bg-gray-50 text-gray-700"}`}
                        >
                          {actionIcons[log.action] || <Shield className="h-3.5 w-3.5" />}
                          {actionLabels[log.action] || log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="gap-1">
                            {entityIcons[log.entityType] || <Shield className="h-3 w-3" />}
                            {entityLabels[log.entityType] || log.entityType}
                          </Badge>
                          {log.entityName && (
                            <span
                              className="text-sm text-gray-600 truncate max-w-[200px]"
                              title={log.entityName}
                            >
                              "{log.entityName}"
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">
                            {log.actorName || "Sistem"}
                          </span>
                          {log.actorEmail && (
                            <span className="text-xs text-muted-foreground">{log.actorEmail}</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
