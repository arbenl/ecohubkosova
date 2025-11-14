import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import ShtoListimClientPage from "./shto-client-page"

export default async function ShtoListimPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA]">
      <Header />
      <ShtoListimClientPage />
      <Footer />
    </div>
  )
}
