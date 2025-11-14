import { z } from "zod"

const trimmedNonEmpty = (field: string, min = 2, max = 120) =>
  z
    .string({ required_error: `${field} është i detyrueshëm.` })
    .trim()
    .min(min, `${field} duhet të ketë të paktën ${min} karaktere.`)
    .max(max, `${field} nuk mund të kalojë ${max} karaktere.`)

const trimmedOptional = (field: string, max = 240) =>
  z
    .string()
    .trim()
    .max(max, `${field} nuk mund të kalojë ${max} karaktere.`)
    .optional()
    .transform((value) => value ?? "")

export const userProfileUpdateSchema = z.object({
  emri_i_plote: trimmedNonEmpty("Emri i plotë"),
  vendndodhja: trimmedOptional("Vendndodhja"),
})

export type UserProfileUpdateInput = z.infer<typeof userProfileUpdateSchema>

export const organizationProfileUpdateSchema = z.object({
  emri: trimmedNonEmpty("Emri i organizatës"),
  pershkrimi: z
    .string({ required_error: "Përshkrimi është i detyrueshëm." })
    .trim()
    .min(10, "Përshkrimi duhet të ketë të paktën 10 karaktere.")
    .max(500, "Përshkrimi nuk mund të kalojë 500 karaktere."),
  interesi_primar: trimmedOptional("Interesi primar", 200),
  person_kontakti: trimmedNonEmpty("Personi i kontaktit"),
  email_kontakti: z
    .string({ required_error: "Emaili i kontaktit është i detyrueshëm." })
    .trim()
    .email("Shkruani një adresë email të vlefshme."),
  vendndodhja: trimmedOptional("Vendndodhja"),
})

export type OrganizationProfileUpdateInput = z.infer<typeof organizationProfileUpdateSchema>
