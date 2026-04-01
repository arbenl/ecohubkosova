import { z } from "zod"

// Email validation regex - RFC 5322 compliant
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email është i detyrueshëm.")
    .transform((v) => v.toLowerCase().trim())
    .pipe(z.string().email("Ju lutemi vendosni një email të vlefshëm.")),
  password: z
    .string()
    .min(1, "Fjalëkalimi është i detyrueshëm.")
    .min(6, "Fjalëkalimi duhet të ketë të paktën 6 karaktere."),
})

const baseRegistrationSchema = z.object({
  full_name: z.string().min(2, "Shkruani emrin e plotë."),
  email: z
    .string()
    .min(1, "Email është i detyrueshëm.")
    .transform((v) => v.toLowerCase().trim())
    .pipe(z.string().email("Email i pavlefshëm.")),
  password: z.string().min(6, "Fjalëkalimi duhet të ketë të paktën 6 karaktere."),
  location: z.string().min(2, "Vendndodhja është e detyrueshme."),
  role: z.enum(["Individ", "OJQ", "Ndërmarrje Sociale", "Kompani"]),
  organization_name: z.string().optional(),
  organization_description: z.string().optional(),
  primary_interest: z.string().optional(),
  contact_person: z.string().optional(),
  contact_email: z
    .string()
    .transform((v) => v.toLowerCase().trim())
    .pipe(
      z.string().refine((email) => email === "" || emailRegex.test(email), {
        message: "Email i pavlefshëm.",
      })
    )
    .optional(),
  newsletter: z.boolean().optional(),
})

export const registrationSchema = baseRegistrationSchema.superRefine((data, ctx) => {
  if (data.role !== "Individ") {
    const requiredFields: Array<keyof typeof data> = [
      "organization_name",
      "organization_description",
      "primary_interest",
      "contact_person",
      "contact_email",
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

export const passwordChangeSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Fjalëkalimi aktual është i detyrueshëm.")
      .min(6, "Fjalëkalimi aktual është i pavlefshëm."),
    newPassword: z
      .string()
      .min(1, "Fjalëkalimi i ri është i detyrueshëm.")
      .min(8, "Fjalëkalimi i ri duhet të ketë të paktën 8 karaktere."),
    confirmNewPassword: z
      .string()
      .min(1, "Konfirmoni fjalëkalimin e ri.")
      .min(8, "Fjalëkalimi i ri duhet të ketë të paktën 8 karaktere."),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmNewPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmNewPassword"],
        message: "Fjalëkalimet nuk përputhen.",
      })
    }
  })

export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>
