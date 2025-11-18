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
