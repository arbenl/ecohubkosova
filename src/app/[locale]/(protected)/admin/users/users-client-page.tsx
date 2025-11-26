"use client"

import { useState, useMemo } from "react"
import { useAdminUsers } from "@/hooks/use-admin-users"
import { UserTable } from "./components/user-table"
import { UserEditModal } from "./components/user-edit-modal"
import { UsersHeader } from "./components/users-header"
import { UsersSearch } from "./components/users-search"
import { UsersEmptyState } from "./components/users-empty-state"
// import { UsersErrorState } from "./components/users-error-state"
// import { UsersSkeleton } from "./components/users-skeleton"
import type { AdminUser } from "@/services/admin/users"

import { useTranslations } from "next-intl"

interface UsersClientPageProps {
  initialUsers: AdminUser[]
  initialError: string | null
  locale: string
}

export default function UsersClientPage({
  initialUsers,
  initialError,
  locale,
}: UsersClientPageProps) {
  const t = useTranslations("admin-users")
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(initialError)

  const { users, editingUser, setEditingUser, handleDelete, handleUpdate } =
    useAdminUsers(initialUsers)

  // Filter users based on search and filters
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.location.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesRole = roleFilter === "all" || user.role === roleFilter
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "approved" && user.is_approved) ||
        (statusFilter === "pending" && !user.is_approved)

      return matchesSearch && matchesRole && matchesStatus
    })
  }, [users, searchQuery, roleFilter, statusFilter])

  const handleRefresh = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // This would trigger a re-fetch in a real implementation
      // For now, we'll just simulate loading
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (err) {
      setError(t("error.generic"))
    } finally {
      setIsLoading(false)
    }
  }

  if (error && users.length === 0) {
    return <div className="p-8 text-center text-red-600">{error}</div>
  }

  return (
    <div className="space-y-8">
      <UsersHeader locale={locale} onRefresh={handleRefresh} isLoading={isLoading} t={t} />

      <UsersSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        t={t}
      />

      {isLoading && users.length === 0 ? (
        <div className="p-8 text-center">Loading...</div>
      ) : filteredUsers.length === 0 ? (
        <UsersEmptyState
          hasFilters={!!searchQuery || roleFilter !== "all" || statusFilter !== "all"}
          onClearFilters={() => {
            setSearchQuery("")
            setRoleFilter("all")
            setStatusFilter("all")
          }}
          t={t}
        />
      ) : (
        <UserTable
          users={filteredUsers}
          onEdit={setEditingUser}
          onDelete={handleDelete}
          isLoading={isLoading}
          t={t}
        />
      )}

      {editingUser && (
        <UserEditModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSubmit={async (data) => {
            const response = await handleUpdate(data)
            if (!response?.error) {
              setEditingUser(null)
            }
            return response
          }}
        />
      )}
    </div>
  )
}
