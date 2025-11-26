import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface UsersSearchProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  roleFilter: string
  onRoleFilterChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  t: any
}

export function UsersSearch({
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  t,
}: UsersSearchProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder={t("users.search.placeholder")}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="flex gap-2">
        <Select value={roleFilter} onValueChange={onRoleFilterChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder={t("users.filters.role")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("users.filters.roleAll")}</SelectItem>
            <SelectItem value="admin">{t("users.filters.roleAdmin")}</SelectItem>
            <SelectItem value="user">{t("users.filters.roleUser")}</SelectItem>
            <SelectItem value="moderator">{t("users.filters.roleModerator")}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder={t("users.filters.status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("users.filters.statusAll")}</SelectItem>
            <SelectItem value="approved">{t("users.filters.statusApproved")}</SelectItem>
            <SelectItem value="pending">{t("users.filters.statusPending")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
