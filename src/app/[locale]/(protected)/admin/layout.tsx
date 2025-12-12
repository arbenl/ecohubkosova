import type React from "react"
import { requireAdminRole } from "@/lib/auth/roles"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Block rendering until admin role is verified server-side
  await requireAdminRole()

  return (
    <div className="flex min-h-screen relative overflow-hidden">
      {/* Admin ambient background */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-gray-50 to-emerald-50/20" />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Gradient orbs */}
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-emerald-100/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 rounded-full bg-teal-100/20 blur-3xl" />
      </div>

      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative z-10">
        <div className="container py-6 px-4 md:px-8 max-w-7xl">{children}</div>
      </main>
    </div>
  )
}
