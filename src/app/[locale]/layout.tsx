import type React from "react"
import { NextIntlClientProvider } from "next-intl"
import { getMessagesForLocale } from "@/lib/messages"
import { AuthProvider } from "@/lib/auth-provider"
import { getServerUser } from "@/lib/supabase-server"

type Props = Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params
  const messages = await getMessagesForLocale(locale)
  const { user: initialUser } = await getServerUser()

  // Provide default empty messages if loading fails
  const safeMessages = messages || {}

  return (
    <NextIntlClientProvider locale={locale} messages={safeMessages}>
      <AuthProvider initialUser={initialUser}>
        {children}
      </AuthProvider>
    </NextIntlClientProvider>
  )
}
