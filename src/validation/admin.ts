import { z } from "zod"

const trimmedString = (min: number, max: number) => z.string().trim().min(min).max(max)

const booleanField = z.boolean()

const optionalUrl = z.string().trim().url("Formati i fotos duhet të jetë URL e vlefshme.").max(500).nullable()

const roleOptions = ["Individ", "OJQ", "Ndërmarrje Sociale", "Kompani", "Admin"] as const

const organizationTypeOptions = ["OJQ", "Ndërmarrje Sociale", "Kompani"] as const

export const adminOrganizationUpdateSchema = z.object({
  emri: trimmedString(3, 150),
  pershkrimi: trimmedString(10, 2000),
  interesi_primar: trimmedString(2, 120),
  person_kontakti: trimmedString(3, 120),
  email_kontakti: z.string().trim().email("Email-i i kontaktit nuk është i vlefshëm.").max(150),
  vendndodhja: trimmedString(2, 150),
  lloji: z.enum(organizationTypeOptions, {
    message: "Zgjidhni një lloj të vlefshëm organizate.",
  }),
  eshte_aprovuar: booleanField,
})

export type AdminOrganizationUpdateInput = z.infer<typeof adminOrganizationUpdateSchema>

export const adminOrganizationMemberUpdateSchema = z.object({
  roli_ne_organizate: trimmedString(2, 150),
  eshte_aprovuar: booleanField,
})

export type AdminOrganizationMemberUpdateInput = z.infer<typeof adminOrganizationMemberUpdateSchema>

export const adminUserUpdateSchema = z.object({
  emri_i_plote: trimmedString(3, 150),
  email: z.string().trim().email("Email-i nuk është i vlefshëm.").max(150),
  vendndodhja: trimmedString(2, 150),
  roli: z.enum(roleOptions, {
    message: "Zgjidhni një rol të vlefshëm përdoruesi.",
  }),
  eshte_aprovuar: booleanField,
})

export type AdminUserUpdateInput = z.infer<typeof adminUserUpdateSchema>

export const adminListingUpdateSchema = z.object({
  titulli: trimmedString(3, 150),
  pershkrimi: trimmedString(10, 2000),
  kategori: trimmedString(2, 120),
  cmimi: z.number().min(0, "Çmimi duhet të jetë së paku 0."),
  njesia: trimmedString(1, 50),
  vendndodhja: trimmedString(2, 150),
  sasia: trimmedString(1, 80),
  lloji_listimit: z.enum(["shes", "blej"], {
    message: "Zgjidhni një lloj të vlefshëm listimi.",
  }),
  eshte_aprovuar: booleanField,
})

export type AdminListingUpdateInput = z.infer<typeof adminListingUpdateSchema>

const tagsSchema = z
  .array(trimmedString(1, 30))
  .max(15, "Maksimumi 15 tags.")
  .nullable()

export const adminArticleBaseSchema = z.object({
  titulli: trimmedString(5, 180),
  permbajtja: trimmedString(20, 10000),
  kategori: trimmedString(2, 120),
  eshte_publikuar: booleanField,
  tags: tagsSchema,
  foto_kryesore: optionalUrl,
})

export const adminArticleCreateSchema = adminArticleBaseSchema
export const adminArticleUpdateSchema = adminArticleBaseSchema

export type AdminArticleCreateInput = z.infer<typeof adminArticleCreateSchema>
export type AdminArticleUpdateInput = z.infer<typeof adminArticleUpdateSchema>
