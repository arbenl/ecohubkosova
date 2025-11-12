import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import ProfiliClientPage from "./profili-client-page" // Will create this client component later

interface UserProfile {
  id: string
  emri_i_plotë: string
  email: string
  vendndodhja: string
  roli: string
  eshte_aprovuar: boolean
  created_at: string
}

interface Organization {
  id: string
  emri: string
  pershkrimi: string
  interesi_primar: string
  person_kontakti: string
  email_kontakti: string
  vendndodhja: string
  lloji: string
  eshte_aprovuar: boolean
}

export default async function ProfiliPage() {
  const supabase = createServerSupabaseClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  const user = session?.user || null

  if (!user) {
    // This should ideally be caught by middleware, but as a fallback
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 py-12">
          <div className="container px-4 md:px-6 max-w-4xl">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold mb-4">Qasje e Ndaluar</h1>
              <p className="text-gray-600 mb-6">Ju duhet të kyçeni për të parë këtë faqe.</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  let userProfile: UserProfile | null = null
  let organization: Organization | null = null
  let error: string | null = null

  try {
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single()

    if (userError) throw userError

    userProfile = userData

    if (userData.roli !== "Individ" && userData.roli !== "Admin") {
      const { data: orgMember } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .eq("eshte_aprovuar", true)
        .single()

      if (orgMember) {
        const { data: orgData, error: orgError } = await supabase
          .from("organizations")
          .select("*")
          .eq("id", orgMember.organization_id)
          .single()

        if (!orgError && orgData) {
          organization = orgData
        }
      }
    }
  } catch (err: any) {
    console.error("Error fetching profile:", err)
    error = err.message || "Gabim gjatë ngarkimit të profilit."
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="container px-4 md:px-6 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Profili im</h1>
            <p className="text-gray-600 mt-1">
              Menaxho informacionet e profilit tënd në ECO HUB KOSOVA
            </p>
          </div>
          {error ? (
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold mb-4">Gabim</h1>
              <p className="text-red-600 mb-6">{error}</p>
            </div>
          ) : (
            <ProfiliClientPage userProfile={userProfile} organization={organization} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
