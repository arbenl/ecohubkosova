import { redirect } from "next/navigation"
import { getLocale } from "next-intl/server"

export default async function HomeRedirect() {
  const locale = await getLocale()
  // Redirect to landing page to let users explore before auth
  redirect(`/${locale}/home`)
}