import HeaderClient from "./header-client"
import { getServerUser } from "@/lib/supabase/server"
import { db } from "@/lib/drizzle"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function Header() {
  const { user } = await getServerUser()

  let userRole: string | null = null
  if (user) {
    try {
      const dbUser = await db.get().query.users.findFirst({
        where: eq(users.id, user.id),
        columns: { role: true },
      })
      userRole = dbUser?.role ?? null
    } catch (error) {
      console.error("Error fetching user role for header:", error)
    }
  }

  return (
    <HeaderClient
      fallbackUserName={user?.user_metadata?.full_name}
      fallbackUserEmail={user?.email}
      userRole={userRole}
    />
  )
}
