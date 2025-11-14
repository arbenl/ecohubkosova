import { boolean, numeric, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const users = pgTable("users", {
  id: uuid("id").primaryKey().notNull(),
  emri_i_plote: text("emri_i_plote").notNull(),
  email: text("email").notNull(),
  vendndodhja: text("vendndodhja").notNull(),
  roli: text("roli").notNull(),
  eshte_aprovuar: boolean("eshte_aprovuar").default(true).notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).default(sql`now()`).notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).default(sql`now()`).notNull(),
})

export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  emri: text("emri").notNull(),
  pershkrimi: text("pershkrimi").notNull(),
  interesi_primar: text("interesi_primar").notNull(),
  person_kontakti: text("person_kontakti").notNull(),
  email_kontakti: text("email_kontakti").notNull(),
  vendndodhja: text("vendndodhja").notNull(),
  lloji: text("lloji").notNull(),
  eshte_aprovuar: boolean("eshte_aprovuar").default(false).notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).default(sql`now()`).notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).default(sql`now()`).notNull(),
})

export const organizationMembers = pgTable(
  "organization_members",
  {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    organization_id: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    user_id: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    roli_ne_organizate: text("roli_ne_organizate").notNull(),
    eshte_aprovuar: boolean("eshte_aprovuar").default(true).notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).default(sql`now()`).notNull(),
  },
  (table) => ({
    organizationMemberUnique: uniqueIndex("organization_members_org_user_unique").on(
      table.organization_id,
      table.user_id
    ),
  })
)

export const articles = pgTable("artikuj", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  titulli: text("titulli").notNull(),
  permbajtja: text("permbajtja").notNull(),
  autori_id: uuid("autori_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  eshte_publikuar: boolean("eshte_publikuar").default(false).notNull(),
  kategori: text("kategori").notNull(),
  tags: text("tags").array().default(sql`ARRAY[]::text[]`).notNull(),
  foto_kryesore: text("foto_kryesore"),
  created_at: timestamp("created_at", { withTimezone: true }).default(sql`now()`).notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).default(sql`now()`).notNull(),
})

export const marketplaceListings = pgTable("tregu_listime", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  created_by_user_id: uuid("created_by_user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  organization_id: uuid("organization_id").references(() => organizations.id, { onDelete: "set null" }),
  titulli: text("titulli").notNull(),
  pershkrimi: text("pershkrimi").notNull(),
  kategori: text("kategori").notNull(),
  cmimi: numeric("cmimi", { precision: 10, scale: 2 }).notNull(),
  njesia: text("njesia").notNull(),
  vendndodhja: text("vendndodhja").notNull(),
  sasia: text("sasia").notNull(),
  lloji_listimit: text("lloji_listimit").notNull(),
  eshte_aprovuar: boolean("eshte_aprovuar").default(false).notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).default(sql`now()`).notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).default(sql`now()`).notNull(),
})

export type User = typeof users.$inferSelect
export type Organization = typeof organizations.$inferSelect
export type OrganizationMember = typeof organizationMembers.$inferSelect
export type Article = typeof articles.$inferSelect
export type MarketplaceListing = typeof marketplaceListings.$inferSelect
