import { db } from "@/lib/drizzle"
import { ecoCategories } from "@/db/schema/marketplace-v2"
import { eq, asc } from "drizzle-orm"

export async function getCategories(locale: "sq" | "en") {
  const categories = await db
    .get()
    .select({
      id: ecoCategories.id,
      name_en: ecoCategories.name_en,
      name_sq: ecoCategories.name_sq,
    })
    .from(ecoCategories)
    .where(eq(ecoCategories.is_active, true))
    .orderBy(asc(ecoCategories.sort_order))

  return categories
}
