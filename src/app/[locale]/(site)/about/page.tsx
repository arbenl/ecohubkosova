import { redirect } from "@/i18n/routing"

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  // Redirect to canonical URL
  redirect({ href: "/about-us", locale })

  return null
}
