export const dynamic = 'force-dynamic'

import { getTranslations } from "next-intl/server"
import ProfileClientPage from "./profile-client-page"
import { getProfileData } from "./actions"

// The interfaces are now defined in actions.ts, but we can keep them here
// for type safety within this component if needed, or remove if redundant.
// For now, we'll trust the types from the action.
interface UserProfile {
  id: string
  full_name: string
  email: string
  location: string
  role: string
  is_approved: boolean
  created_at: string
}

interface Organization {
  id: string
  name: string
  description: string
  primary_interest: string
  contact_person: string
  contact_email: string
  location: string
  type: string
  is_approved: boolean
}

export default async function ProfiliPage() {
  const t = await getTranslations("profile")
  const tCommon = await getTranslations("common")
  const { userProfile, organization, error } = await getProfileData()

  // Handle case where user is not logged in (or session failed)
  if (!userProfile) {
    return (
      <>
        <main className="flex-1 py-12">
          <div className="container px-4 md:px-6 max-w-4xl">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold mb-4">{tCommon("accessDenied")}</h1>
              <p className="text-gray-600 mb-6">
                {error || tCommon("loginRequired")}
              </p>
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <main className="flex-1 py-12">
        <div className="container px-4 md:px-6 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">{t("myProfile")}</h1>
            <p className="text-gray-600 mt-1">
              {t("manageProfileDescription")}
            </p>
          </div>
          {error ? (
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold mb-4">{tCommon("error")}</h1>
              <p className="text-red-600 mb-6">{error}</p>
            </div>
          ) : (
            <ProfileClientPage userProfile={userProfile} organization={organization} />
          )}
        </div>
      </main>
    </>
  )
}
