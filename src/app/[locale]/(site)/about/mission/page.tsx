import { redirect } from "@/i18n/routing"

export default async function MissionPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  // Redirect to canonical About Us page
  redirect({ href: "/about-us", locale })

  return null
}
