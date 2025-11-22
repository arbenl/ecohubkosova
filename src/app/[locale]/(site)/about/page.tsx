import { redirect } from "next/navigation"

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  // Redirect to canonical URL
  redirect(`/${locale}/about-us`)

  return null
}
