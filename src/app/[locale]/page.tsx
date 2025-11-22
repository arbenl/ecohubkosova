import { redirect } from "next/navigation"

export default async function HomeRedirect({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  // Redirect to marketplace page to let users explore listings
  redirect(`/${locale}/marketplace`)
}
