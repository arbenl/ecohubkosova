import { z } from "zod"

export const listingCreateSchema = z.object({
  titulli: z.string().min(3, "Titulli duhet të ketë të paktën 3 karaktere."),
  pershkrimi: z.string().min(10, "Përshkrimi duhet të ketë të paktën 10 karaktere."),
  kategori: z.string().min(1, "Zgjidhni kategorinë."),
  cmimi: z.preprocess(
    (value) => (value === "" || value === undefined ? undefined : Number(value)),
    z.number().nonnegative("Çmimi duhet të jetë pozitiv.").optional()
  ),
  njesia: z.string().min(1, "Njësia është e detyrueshme."),
  vendndodhja: z.string().min(2, "Vendndodhja është e detyrueshme."),
  sasia: z.string().min(1, "Sasia është e detyrueshme."),
  lloji_listimit: z.enum(["shes", "blej"]),
})

export type ListingCreateInput = z.infer<typeof listingCreateSchema>
