import { redirect } from "@/i18n/routing"

export default async function HomeRedirect({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  // Redirect to marketplace page to let users explore listings
  redirect({ href: "/marketplace", locale })
}
