import type { ReactNode } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12">
        {children}
      </main>
      <Footer />
    </div>
  )
}
