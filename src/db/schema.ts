import { boolean, integer, numeric, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const users = pgTable("public.users", {
  id: uuid("id").primaryKey().notNull(),
  full_name: text("full_name").notNull(),
  email: text("email").notNull(),
  location: text("location").notNull(),
  role: text("role").notNull(),
  is_approved: boolean("is_approved").default(true).notNull(),
  session_version: integer("session_version").notNull().default(1),
  created_at: timestamp("created_at", { withTimezone: true }).default(sql`now()`).notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).default(sql`now()`).notNull(),
})

export const organizations = pgTable("public.organizations", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  primary_interest: text("primary_interest").notNull(),
  contact_person: text("contact_person").notNull(),
  contact_email: text("contact_email").notNull(),
  location: text("location").notNull(),
  type: text("type").notNull(),
  is_approved: boolean("is_approved").default(false).notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).default(sql`now()`).notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).default(sql`now()`).notNull(),
})

export const organizationMembers = pgTable(
  "public.organization_members",
  {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    organization_id: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    user_id: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    role_in_organization: text("role_in_organization").notNull(),
    is_approved: boolean("is_approved").default(true).notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).default(sql`now()`).notNull(),
  },
  (table) => ({
    organizationMemberUnique: uniqueIndex("organization_members_org_user_unique").on(
      table.organization_id,
      table.user_id
    ),
  })
)

export const articles = pgTable("public.artikuj", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  author_id: uuid("author_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  is_published: boolean("is_published").default(false).notNull(),
  category: text("category").notNull(),
  tags: text("tags").array().default(sql`ARRAY[]::text[]`).notNull(),
  featured_image: text("featured_image"),
  created_at: timestamp("created_at", { withTimezone: true }).default(sql`now()`).notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).default(sql`now()`).notNull(),
})

export const marketplaceListings = pgTable("public.tregu_listime", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  created_by_user_id: uuid("created_by_user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  organization_id: uuid("organization_id").references(() => organizations.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  unit: text("unit").notNull(),
  location: text("location").notNull(),
  quantity: text("quantity").notNull(),
  listing_type: text("listing_type").notNull(),
  gjendja: text("gjendja"),
  is_approved: boolean("is_approved").default(false).notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).default(sql`now()`).notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).default(sql`now()`).notNull(),
})

export type User = typeof users.$inferSelect
export type Organization = typeof organizations.$inferSelect
export type OrganizationMember = typeof organizationMembers.$inferSelect
export type Article = typeof articles.$inferSelect
export type MarketplaceListing = typeof marketplaceListings.$inferSelect
