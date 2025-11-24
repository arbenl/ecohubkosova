import { redirect } from "next/navigation"

export default async function MissionPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  // Redirect to canonical About Us page
  redirect(`/${locale}/about-us`)

  return null
}
