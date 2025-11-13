// types/index.ts

import type { User as SupabaseAuthUser } from "@supabase/supabase-js"

// User Profile Interface
export interface UserProfile {
  id: string
  emri_i_plote: string
  email: string
  vendndodhja: string
  roli: string // e.g., "Individ", "Admin", "Organizational"
  eshte_aprovuar: boolean
  created_at: string
}

// Organization Interface
export interface Organization {
  id: string
  emri: string
  pershkrimi: string
  interesi_primar: string
  person_kontakti: string
  email_kontakti: string
  vendndodhja: string
  lloji: string // e.g., "OJQ", "Ndërmarrje Sociale", "Kompani"
  eshte_aprovuar: boolean
  created_at: string
  updated_at: string | null
}

// Listing Interface for tregu_listime
export interface Listing {
  id: string
  titulli: string
  pershkrimi: string
  foto_url: string | null
  cmimi: number | null // Use 'c' to match database column name and 'number | null' for consistency
  monedha: string | null
  kategori: string
  gjendja: string
  vendndodhja: string
  kontakti: string // The contact information for the listing
  created_at: string
  user_id: string
  eshte_publikuar: boolean
  // Joined relations
  users?: {
    emri_i_plote: string
    email?: string // Include email for contact if necessary
  }
  organizations?: {
    emri: string
    email_kontakti?: string // Include email for contact if necessary
  }
  // This type is used by the full listing details, which might include these
  sasia: string
  njesia: string
  lloji_listimit: "shes" | "blej"
}

// Dashboard Specific Article and Partner Interfaces
export interface DashboardArticle {
  id: string
  titulli: string
  users?: {
    emri_i_plote?: string | null
  } | null
}

export interface KeyPartner {
  id: string
  emri: string
  pershkrimi: string
  vendndodhja: string
  lloji?: string | null
}
