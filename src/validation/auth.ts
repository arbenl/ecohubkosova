import { z } from "zod"

export const loginSchema = z.object({
  email: z.string({ required_error: "Email është i detyrueshëm." }).email("Ju lutemi vendosni një email të vlefshëm."),
  password: z
    .string({ required_error: "Fjalëkalimi është i detyrueshëm." })
    .min(6, "Fjalëkalimi duhet të ketë të paktën 6 karaktere."),
})

const baseRegistrationSchema = z.object({
  emri_i_plote: z.string().min(2, "Shkruani emrin e plotë."),
  email: z.string().email("Email i pavlefshëm."),
  password: z.string().min(6, "Fjalëkalimi duhet të ketë të paktën 6 karaktere."),
  vendndodhja: z.string().min(2, "Vendndodhja është e detyrueshme."),
  roli: z.enum(["Individ", "OJQ", "Ndërmarrje Sociale", "Kompani"]),
  emri_organizates: z.string().optional(),
  pershkrimi_organizates: z.string().optional(),
  interesi_primar: z.string().optional(),
  person_kontakti: z.string().optional(),
  email_kontakti: z.string().email().optional(),
  newsletter: z.boolean().optional(),
})

export const registrationSchema = baseRegistrationSchema.superRefine((data, ctx) => {
  if (data.roli !== "Individ") {
    const requiredFields: Array<keyof typeof data> = [
      "emri_organizates",
      "pershkrimi_organizates",
      "interesi_primar",
      "person_kontakti",
      "email_kontakti",
    ]

    requiredFields.forEach((field) => {
      if (!data[field]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [field],
          message: "Ky fushë është e detyrueshme për organizatat.",
        })
      }
    })
  }
})

export type RegistrationInput = z.infer<typeof registrationSchema>
export type LoginInput = z.infer<typeof loginSchema>
