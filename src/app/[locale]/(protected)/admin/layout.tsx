import type React from "react"
import { requireAdminRole } from "@/lib/auth/roles"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Block rendering until admin role is verified server-side
  // This prevents the freeze caused by role check happening in page actions
  await requireAdminRole()

  // Render premium full-width dashboard without V1 sidebar
  return <>{children}</>
}
