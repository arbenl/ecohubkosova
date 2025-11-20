"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"

interface City {
  value: string
  label: string
  region?: string
}

export async function getCities(locale: "sq" | "en" = "sq"): Promise<City[]> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from("cities" as any)
    .select("*")
    .eq("is_active", true)
    .order("display_order")

  if (error) {
    console.error("Error fetching cities:", error)
    return []
  }

  if (!data) return []

  // Return cities with the appropriate language field
  return data.map((city: any) => ({
    value: locale === "sq" ? city.name_sq : city.name_en,
    label: locale === "sq" ? city.name_sq : city.name_en,
    region: city.region || undefined,
  }))
}

export type { City }
