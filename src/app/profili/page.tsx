export const dynamic = 'force-dynamic'

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import ProfiliClientPage from "./profili-client-page"
import { getProfileData } from "./actions"

// The interfaces are now defined in actions.ts, but we can keep them here
// for type safety within this component if needed, or remove if redundant.
// For now, we'll trust the types from the action.
interface UserProfile {
  id: string
  emri_i_plote: string
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
  const { userProfile, organization, error } = await getProfileData()

  // Handle case where user is not logged in (or session failed)
  if (!userProfile) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 py-12">
          <div className="container px-4 md:px-6 max-w-4xl">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold mb-4">Qasje e Ndaluar</h1>
              <p className="text-gray-600 mb-6">
                {error || "Ju duhet të kyçeni për të parë këtë faqe."}
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
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
