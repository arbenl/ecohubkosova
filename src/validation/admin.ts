import { z } from "zod"

const trimmedString = (min: number, max: number) => z.string().trim().min(min).max(max)

const booleanField = z.boolean()

const optionalUrl = z
  .preprocess(
    (val) =>
      val === undefined || val === null || (typeof val === "string" && val.trim() === "")
        ? null
        : val,
    z.string().trim().url("Formati i fotos duhet të jetë URL e vlefshme.").max(500).nullable()
  )
  .optional()

const optionalLanguage = z
  .preprocess(
    (val) =>
      val === undefined || val === null || (typeof val === "string" && val.trim() === "")
        ? null
        : val,
    trimmedString(2, 10).nullable()
  )
  .optional()

const contentField = z
  .preprocess((val) => {
    if (val === undefined) return undefined
    if (val === null) return null
    if (typeof val === "string" && val.trim() === "") return null
    return val
  }, trimmedString(20, 10000).nullable())
  .optional()

const roleOptions = ["Individ", "OJQ", "Ndërmarrje Sociale", "Kompani", "Admin"] as const

const organizationTypeOptions = ["OJQ", "Ndërmarrje Sociale", "Kompani"] as const

export const adminOrganizationUpdateSchema = z.object({
  name: trimmedString(3, 150),
  description: trimmedString(10, 2000),
  primary_interest: trimmedString(2, 120),
  contact_person: trimmedString(3, 120),
  contact_email: z.string().trim().email("Email-i i kontaktit nuk është i vlefshëm.").max(150),
  location: trimmedString(2, 150),
  type: z.enum(organizationTypeOptions, {
    message: "Zgjidhni një lloj të vlefshëm organizate.",
  }),
  is_approved: booleanField,
})

export type AdminOrganizationUpdateInput = z.infer<typeof adminOrganizationUpdateSchema>

export const adminOrganizationMemberUpdateSchema = z.object({
  role_in_organization: trimmedString(2, 150),
  is_approved: booleanField,
})

export type AdminOrganizationMemberUpdateInput = z.infer<typeof adminOrganizationMemberUpdateSchema>

export const adminUserUpdateSchema = z.object({
  full_name: trimmedString(3, 150),
  email: z.string().trim().email("Email-i nuk është i vlefshëm.").max(150),
  location: trimmedString(2, 150),
  role: z.enum(roleOptions, {
    message: "Zgjidhni një rol të vlefshëm përdoruesi.",
  }),
  is_approved: booleanField,
})

export type AdminUserUpdateInput = z.infer<typeof adminUserUpdateSchema>

export const adminListingUpdateSchema = z.object({
  title: trimmedString(3, 150),
  description: trimmedString(10, 2000),
  category: trimmedString(2, 120),
  price: z.number().min(0, "Çmimi duhet të jetë së paku 0."),
  unit: trimmedString(1, 50),
  location: trimmedString(2, 150),
  quantity: trimmedString(1, 80),
  listing_type: z.enum(["shes", "blej"], {
    message: "Zgjidhni një lloj të vlefshëm listimi.",
  }),
  is_approved: booleanField,
})

export type AdminListingUpdateInput = z.infer<typeof adminListingUpdateSchema>

const tagsSchema = z.array(trimmedString(1, 30)).max(15, "Maksimumi 15 tags.").nullable().optional()

export const adminArticleBaseSchema = z.object({
  title: trimmedString(5, 180),
  content: contentField,
  external_url: optionalUrl,
  original_language: optionalLanguage,
  category: trimmedString(2, 120),
  is_published: booleanField,
  tags: tagsSchema,
  featured_image: optionalUrl,
})

export const adminArticleCreateSchema = adminArticleBaseSchema
export const adminArticleUpdateSchema = adminArticleBaseSchema

export type AdminArticleCreateInput = z.infer<typeof adminArticleCreateSchema>
export type AdminArticleUpdateInput = z.infer<typeof adminArticleUpdateSchema>
