import { redirect } from "next/navigation"

export default async function EcoOrganizationsRedirectPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  // Redirect to canonical Partners directory
  // Partners page has all eco-organization functionality with role filters
  redirect(`/${locale}/partners`)
}
