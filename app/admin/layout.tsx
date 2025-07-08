import type React from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AuthProvider } from "@/lib/auth-provider"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </AuthProvider>
  )
}
