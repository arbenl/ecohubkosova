import { z } from "zod"

export const listingCreateSchema = z.object({
  title: z.string().min(3, "Titulli duhet të ketë të paktën 3 karaktere."),
  description: z.string().min(10, "Përshkrimi duhet të ketë të paktën 10 karaktere."),
  category: z.string().min(1, "Zgjidhni kategorinë."),
  price: z.preprocess(
    (value) => (value === "" || value === undefined ? undefined : Number(value)),
    z.number().nonnegative("Çmimi duhet të jetë pozitiv.").optional()
  ),
  unit: z.string().min(1, "Njësia është e detyrueshme."),
  location: z.string().min(2, "Vendndodhja është e detyrueshme."),
  quantity: z.string().min(1, "Sasia është e detyrueshme."),
  listing_type: z.enum(["shes", "blej"]),
})

export type ListingCreateInput = z.infer<typeof listingCreateSchema>

// Marketplace V2 listing form validation
const trimmedNonEmpty = (field: string, min = 2, max = 200) =>
  z
    .string({ required_error: `${field} është i detyrueshëm.` })
    .trim()
    .min(min, `${field} duhet të ketë të paktën ${min} karaktere.`)
    .max(max, `${field} nuk mund të kalojë ${max} karaktere.`)

const trimmedOptional = (field: string, max = 500) =>
  z
    .string()
    .trim()
    .max(max, `${field} nuk mund të kalojë ${max} karaktere.`)
    .optional()

export const listingFormSchema = z.object({
  // Basic info
  title: trimmedNonEmpty("Titulli", 3, 100),
  description: trimmedNonEmpty("Përshkrimi", 10, 2000),
  category_id: z.string({ required_error: "Kategoria është e detyrueshme." }).uuid("Kategoria është e pavlefshme."),
  flow_type: z.enum([
    "OFFER_WASTE",
    "OFFER_MATERIAL", 
    "OFFER_RECYCLED_PRODUCT",
    "REQUEST_MATERIAL",
    "SERVICE_REPAIR",
    "SERVICE_REFURBISH", 
    "SERVICE_COLLECTION",
    "SERVICE_CONSULTING",
    "SERVICE_OTHER"
  ], { required_error: "Lloji i rrjedhës është i detyrueshëm." }),
  condition: z.enum([
    "NEW",
    "USED_EXCELLENT",
    "USED_GOOD", 
    "USED_FAIR",
    "USED_REPAIRABLE",
    "SCRAP",
    "WASTE_STREAM"
  ]).optional(),
  lifecycle_stage: z.enum([
    "RAW_MATERIAL",
    "COMPONENT", 
    "SEMIFINISHED",
    "FINISHED_PRODUCT",
    "END_OF_LIFE",
    "WASTE"
  ]).optional(),

  // Quantity & units
  quantity: z.preprocess(
    (value) => (value === "" || value === undefined ? undefined : Number(value)),
    z.number().positive("Sasia duhet të jetë pozitive.").optional()
  ),
  unit: trimmedOptional("Njësia", 20),

  // Pricing
  price: z.preprocess(
    (value) => (value === "" || value === undefined ? undefined : Number(value)),
    z.number().nonnegative("Çmimi duhet të jetë pozitiv ose zero.").optional()
  ),
  currency: z.string().default("EUR"),
  pricing_type: z.enum([
    "FIXED",
    "NEGOTIABLE", 
    "FREE",
    "BARTER",
    "ON_REQUEST"
  ], { required_error: "Lloji i çmimit është i detyrueshëm." }),

  // Location
  country: z.string().default("XK"),
  city: trimmedOptional("Qyteti", 100),
  region: trimmedOptional("Rajoni", 100),
  location_details: trimmedOptional("Detajet e vendndodhjes", 500),

  // Eco features
  eco_labels: z.array(z.string()).default([]),
  eco_score: z.preprocess(
    (value) => (value === "" || value === undefined ? undefined : Number(value)),
    z.number().min(0).max(100).optional()
  ),

  // Tags
  tags: z.array(z.string()).default([]),

  // Media (stored URLs from upload, not file objects)
  media: z
    .array(
      z.object({
        id: z.string(),
        url: z.string().url(),
        storage_path: z.string().optional().nullable(),
        file_type: z.string(),
        mime_type: z.string().optional().nullable(),
        file_size: z.number().optional().nullable(),
        is_primary: z.boolean().default(false),
        sort_order: z.number().int().default(0),
        alt_text: z.string().optional(),
        caption: z.string().optional(),
      })
    )
    .default([]),
})

export type ListingFormInput = z.infer<typeof listingFormSchema>
