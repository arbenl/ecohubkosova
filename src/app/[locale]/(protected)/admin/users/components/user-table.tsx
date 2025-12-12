"use client"

import { MoreHorizontal, Edit, Trash2, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { AdminUser } from "@/services/admin/users"

interface UserTableProps {
  users?: AdminUser[]
  onEdit?: (user: AdminUser) => void
  onDelete?: (userId: string) => void
  isLoading?: boolean
  t?: (key: string) => string
}

function getRoleBadgeVariant(role: string) {
  switch (role) {
    case "admin":
      return "destructive"
    case "moderator":
      return "secondary"
    default:
      return "outline"
  }
}

function getStatusBadgeVariant(isApproved: boolean) {
  return isApproved ? "default" : "secondary"
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function UserTable({
  users = [],
  onEdit = () => undefined,
  onDelete = () => undefined,
  isLoading,
  t = (key: string) => key,
}: UserTableProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left text-sm font-semibold text-gray-900 px-6 py-4">
                {t("users.table.headers.user")}
              </th>
              <th className="text-left text-sm font-semibold text-gray-900 px-6 py-4">
                {t("users.table.headers.email")}
              </th>
              <th className="text-left text-sm font-semibold text-gray-900 px-6 py-4">
                {t("users.table.headers.location")}
              </th>
              <th className="text-left text-sm font-semibold text-gray-900 px-6 py-4">
                {t("users.table.headers.role")}
              </th>
              <th className="text-left text-sm font-semibold text-gray-900 px-6 py-4">
                {t("users.table.headers.status")}
              </th>
              <th className="text-left text-sm font-semibold text-gray-900 px-6 py-4">
                {t("users.table.headers.created")}
              </th>
              <th className="text-right text-sm font-semibold text-gray-900 px-6 py-4">
                {t("users.table.headers.actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-emerald-100 text-emerald-700 font-medium">
                        {getInitials(user.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-gray-900">{user.full_name}</div>
                      <div className="text-sm text-gray-500">ID: {user.id.slice(0, 8)}...</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{user.email}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{user.location}</div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={getRoleBadgeVariant(user.role)} className="capitalize">
                    {t(`users.roles.${user.role}`)}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {user.is_approved ? (
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-amber-600" />
                    )}
                    <Badge variant={getStatusBadgeVariant(user.is_approved)}>
                      {user.is_approved ? t("users.status.approved") : t("users.status.pending")}
                    </Badge>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {new Date(user.created_at).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(user.created_at).toLocaleTimeString()}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">{t("users.actions.openMenu")}</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(user)}>
                        <Edit className="mr-2 h-4 w-4" />
                        {t("users.actions.edit")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(user.id)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t("users.actions.delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && !isLoading && (
        <div className="px-6 py-12 text-center text-gray-500">{t("users.table.empty")}</div>
      )}
    </div>
  )
}
