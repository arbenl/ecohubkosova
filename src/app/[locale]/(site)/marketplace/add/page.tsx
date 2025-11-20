import { getLocale } from "next-intl/server"
import { getCities } from "@/db/cities"
import AddListingClientPage from "./add-listing-client-page"

export default async function AddListingPage() {
  const locale = (await getLocale()) as "sq" | "en"
  const cities = await getCities(locale)

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA]">
      <>
        <AddListingClientPage cities={cities} />
      </>
    </div>
  )
}
