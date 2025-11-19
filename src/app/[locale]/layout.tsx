import type React from "react"
import { NextIntlClientProvider } from "next-intl"
import { AuthProvider } from "@/lib/auth-provider"

type Props = Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params

  // Provide intl context for client components
  return (
    <NextIntlClientProvider locale={locale} messages={{}}>
      <AuthProvider initialUser={null}>
        {children}
      </AuthProvider>
    </NextIntlClientProvider>
  )
}
