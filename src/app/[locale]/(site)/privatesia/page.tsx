import { redirect } from "@/i18n/routing"

export default async function LegacyPrivacyRedirect({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  redirect({ href: "/legal/privacy", locale })
}
