import { redirect } from "next/navigation"

export default async function HomeRedirect({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  // Redirect to landing page to let users explore before auth
  redirect(`/${locale}/home`)
}
