"use server"

import { createRouteHandlerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { listingCreateSchema } from "@/validation/listings"

interface FormPayload {
  titulli: string
  pershkrimi: string
  kategori: string
  cmimi: string
  njesia: string
  vendndodhja: string
  sasia: string
  lloji_listimit: "shes" | "blej"
}

export async function createListing(formData: FormPayload) {
  const supabase = createRouteHandlerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    // This should ideally be caught by middleware, but as a fallback
    redirect("/auth/kycu?message=Ju duhet të kyçeni për të shtuar një listim.")
  }

  try {
    const parsed = listingCreateSchema.safeParse(formData)
    if (!parsed.success) {
      return { error: parsed.error.errors[0]?.message || "Formulari ka të dhëna të pavlefshme." }
    }

    // Check if user is part of an organization
    const { data: orgMember, error: orgError } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .eq("eshte_aprovuar", true)
      .single()

    if (orgError && orgError.code !== 'PGRST116') { // PGRST116 means no rows found (user not in org)
      console.error("Error fetching organization member:", orgError);
      return { error: "Gabim gjatë kontrollit të anëtarësisë në organizatë." };
    }

    // Create listing
    const { error: insertError } = await supabase.from("tregu_listime").insert({
      created_by_user_id: user.id,
      organization_id: orgMember?.organization_id || null,
      titulli: parsed.data.titulli,
      pershkrimi: parsed.data.pershkrimi,
      kategori: parsed.data.kategori,
      cmimi: parsed.data.cmimi ?? null,
      njesia: parsed.data.njesia,
      vendndodhja: parsed.data.vendndodhja,
      sasia: parsed.data.sasia,
      lloji_listimit: parsed.data.lloji_listimit,
      eshte_aprovuar: false, // Requires approval
    })

    if (insertError) {
      console.error("Error inserting listing:", insertError);
      return { error: insertError.message || "Gabim gjatë shtimit të listimit." };
    }

    revalidatePath("/tregu"); // Revalidate the market page to show new listing
    return { success: true };

  } catch (error: any) {
    console.error("Server Action Error:", error);
    return { error: error.message || "Gabim i panjohur gjatë shtimit të listimit." };
  }
}
