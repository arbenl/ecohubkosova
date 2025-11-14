import { createServerSupabaseClient } from "@/lib/supabase/server"
import HeaderClient from "@/components/header-client"

export async function Header() {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let fallbackName: string | null = null

  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("emri_i_plote")
      .eq("id", user.id)
      .maybeSingle()

    fallbackName = profile?.emri_i_plote || user.email?.split("@")[0] || null
  }

  return <HeaderClient fallbackUserName={fallbackName} fallbackUserEmail={user?.email ?? null} />
}

export default Header
