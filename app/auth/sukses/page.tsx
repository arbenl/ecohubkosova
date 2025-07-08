import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

export default function SuksesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12">
        <div className="container px-4 md:px-6 max-w-md">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="rounded-full bg-emerald-100 p-3">
              <CheckCircle className="h-12 w-12 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold">Regjistrimi u krye me sukses!</h1>
            <p className="text-gray-600">
              Faleminderit për regjistrimin në ECO HUB KOSOVA. Ju kemi dërguar një email konfirmimi në adresën tuaj.
            </p>
            {/* Additional message for organizations */}
            <div className="bg-blue-50 p-4 rounded-lg text-blue-800 text-sm">
              <p>
                <strong>Shënim:</strong> Nëse jeni regjistruar si organizatë, profili juaj do të shqyrtohet nga
                administratorët tanë përpara se të aktivizohet plotësisht. Do t'ju njoftojmë me email sapo të aprovohet.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                asChild
              >
                <Link href="/auth/kycu">Kyçu në platformë</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">Kthehu në faqen kryesore</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
