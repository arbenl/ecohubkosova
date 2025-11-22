import { z } from "zod"

export const organizationOnboardingSchema = z.object({
  name: z.string().min(2, "Emri duhet të ketë të paktën 2 karaktere").max(200),
  description: z.string().min(10, "Përshkrimi duhet të jetë më i detajuar").max(1000),
  primary_interest: z.string().min(2, "Interesi primar është i detyrueshëm").max(200),
  contact_person: z.string().min(2, "Emri i personit kontakti është i detyrueshëm").max(200),
  contact_email: z.string().email("Email-i kontakti duhet të jetë i vlefshëm"),
  location: z.string().min(2, "Vendndodhja është e detyrueshme").max(100),
  type: z.enum(["OJQ", "Ndërmarrje Sociale", "Kompani"], {
    errorMap: () => ({ message: "Lloji i organizatës është i detyrueshëm" }),
  }),
})

export type OrganizationOnboardingInput = z.infer<typeof organizationOnboardingSchema>
