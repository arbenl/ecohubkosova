// types/index.ts

import type { User as SupabaseAuthUser } from "@supabase/supabase-js"

// User Profile Interface
export interface UserProfile {
  id: string
  full_name: string
  email: string
  location: string
  role: string // e.g., "Individ", "Admin", "Organizational"
  is_approved: boolean
  created_at: string
}

// Organization Interface
export interface Organization {
  id: string
  name: string
  description: string
  primary_interest: string
  contact_person: string
  contact_email: string
  location: string
  type: string // e.g., "OJQ", "Ndërmarrje Sociale", "Kompani"
  is_approved: boolean
  created_at: string
  updated_at: string | null
}

// Listing Interface for tregu_listime
export interface Listing {
  id: string
  title: string
  description: string
  foto_url: string | null
  price: number | null
  currency: string | null
  category: string
  category_id?: string
  condition: string
  location: string
  location_details?: string | null
  contact: string // The contact information for the listing
  created_at: string
  user_id: string
  is_published: boolean
  // V2 marketplace fields (optional to keep compatibility with legacy callers)
  flow_type?: string
  pricing_type?: string | null
  visibility?: string | null
  status?: string | null
  updated_at?: string | null
  city?: string | null
  region?: string | null
  eco_labels?: string[] | null
  eco_score?: number | null
  tags?: string[] | null
  category_name_en?: string | null
  category_name_sq?: string | null
  organization_id?: string | null
  organization_name?: string | null
  organization_contact_email?: string | null
  organization_contact_phone?: string | null
  organization_contact_website?: string | null
  organization_contact_person?: string | null
  creator_full_name?: string | null
  creator_email?: string | null
  // Joined relations
  users?: {
    full_name: string
    email?: string // Include email for contact if necessary
  }
  organizations?: {
    name: string
    contact_email?: string // Include email for contact if necessary
    contact_person?: string
  }
  // This type is used by the full listing details, which might include these
  quantity: string
  unit: string
  listing_type: "shes" | "blej"
}

// Dashboard Specific Article and Partner Interfaces
export interface DashboardArticle {
  id: string
  title: string
  users?: {
    full_name?: string | null
  } | null
}

export interface KeyPartner {
  id: string
  name: string
  description: string
  location: string
  type?: string | null
}
