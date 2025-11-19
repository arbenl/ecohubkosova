"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getServerUser } from "@/lib/supabase/server"
import { createUserListing } from "@/services/listings"
import { listingCreateSchema } from "@/validation/listings"

interface FormPayload {
  title: string
  description: string
  category: string
  price: string
  unit: string
  location: string
  quantity: string
  listing_type: "shes" | "blej"
}

export async function createListing(formData: FormPayload) {
  const { user } = await getServerUser()

  if (!user) {
    // This should ideally be caught by middleware, but as a fallback
    redirect("/login?message=Ju duhet të kyçeni për të shtuar një listim.")
  }

  try {
    const parsed = listingCreateSchema.safeParse(formData)
    if (!parsed.success) {
      return { error: parsed.error.errors[0]?.message || "Formulari ka të dhëna të pavlefshme." }
    }

    const result = await createUserListing(user.id, parsed.data)

    if ("error" in result) {
      return { error: result.error }
    }

    revalidatePath("/marketplace") // Revalidate the market page to show new listing
    return { success: true }
  } catch (error: any) {
    console.error("Server Action Error:", error)
    return { error: error.message || "Gabim i panjohur gjatë shtimit të listimit." }
  }
}
