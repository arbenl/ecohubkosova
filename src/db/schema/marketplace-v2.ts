// src/db/schema/marketplace-v2.ts
// Marketplace V2 Tables - Eco-First Circular Economy Platform

import {
    boolean,
    integer,
    jsonb,
    numeric,
    pgTable,
    text,
    timestamp,
    uniqueIndex,
    uuid,
    index,
} from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { users, organizations } from "../schema"
import {
    flowTypeEnum,
    conditionEnum,
    lifecycleStageEnum,
    pricingTypeEnum,
    orgRoleEnum,
    verificationStatusEnum,
    listingStatusEnum,
    visibilityEnum,
    interactionTypeEnum,
} from "./enums"

// ============================================================================
// ECO CATEGORIES - Hierarchical taxonomy
// ============================================================================
export const ecoCategories = pgTable(
    "eco_categories",
    {
        id: uuid("id").primaryKey().defaultRandom().notNull(),
        parent_id: uuid("parent_id"),

        // Content (i18n)
        slug: text("slug").notNull().unique(),
        name_en: text("name_en").notNull(),
        name_sq: text("name_sq").notNull(),
        description_en: text("description_en"),
        description_sq: text("description_sq"),

        // Display
        icon_key: text("icon_key"),
        color: text("color"),
        sort_order: integer("sort_order").default(0).notNull(),
        is_featured: boolean("is_featured").default(false).notNull(),
        is_active: boolean("is_active").default(true).notNull(),

        // Hierarchy
        level: integer("level").default(0).notNull(),
        path: text("path"),

        created_at: timestamp("created_at", { withTimezone: true })
            .default(sql`now()`)
            .notNull(),
    },
    (table) => ({
        parentIdx: index("eco_categories_parent_idx").on(table.parent_id),
        slugIdx: index("eco_categories_slug_idx").on(table.slug),
    })
)

// ============================================================================
// ECO ORGANIZATIONS - Extended org profiles
// ============================================================================
export const ecoOrganizations = pgTable("eco_organizations", {
    id: uuid("id").primaryKey().defaultRandom().notNull(),

    // Link to core organizations table
    organization_id: uuid("organization_id")
        .references(() => organizations.id, { onDelete: "cascade" })
        .notNull()
        .unique(),

    // Business Role
    org_role: orgRoleEnum("org_role").notNull(),

    // Verification
    verification_status: verificationStatusEnum("verification_status")
        .notNull()
        .default("UNVERIFIED"),
    verification_source: text("verification_source"),
    verified_at: timestamp("verified_at", { withTimezone: true }),
    verified_by_user_id: uuid("verified_by_user_id").references(() => users.id),

    // Eco Credentials
    certifications: text("certifications").array().default(sql`ARRAY[]::text[]`),
    licenses: text("licenses").array().default(sql`ARRAY[]::text[]`),

    // Business Details
    waste_types_handled: text("waste_types_handled").array(),
    service_areas: text("service_areas").array(),
    processing_capacity: text("processing_capacity"),

    // Logistics
    pickup_available: boolean("pickup_available").default(false),
    delivery_available: boolean("delivery_available").default(false),

    // Metadata
    metadata: jsonb("metadata").default(sql`'{}'::jsonb`),

    // Stats
    total_listings: integer("total_listings").default(0).notNull(),
    total_transactions: integer("total_transactions").default(0).notNull(),

    created_at: timestamp("created_at", { withTimezone: true })
        .default(sql`now()`)
        .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
        .default(sql`now()`)
        .notNull(),
})

// ============================================================================
// ECO LISTINGS - Core marketplace listings
// ============================================================================
export const ecoListings = pgTable(
    "eco_listings",
    {
        // Identity
        id: uuid("id").primaryKey().defaultRandom().notNull(),

        // Relationships
        created_by_user_id: uuid("created_by_user_id")
            .references(() => users.id, { onDelete: "cascade" })
            .notNull(),
        organization_id: uuid("organization_id").references(() => ecoOrganizations.id, {
            onDelete: "set null",
        }),
        category_id: uuid("category_id")
            .references(() => ecoCategories.id, { onDelete: "restrict" })
            .notNull(),

        // Core Content
        title: text("title").notNull(),
        description: text("description").notNull(),

        // Circular Economy Classification
        flow_type: flowTypeEnum("flow_type").notNull(),
        condition: conditionEnum("condition"),
        lifecycle_stage: lifecycleStageEnum("lifecycle_stage"),

        // Quantity & Units
        quantity: numeric("quantity", { precision: 10, scale: 2 }),
        unit: text("unit"),

        // Pricing
        price: numeric("price", { precision: 10, scale: 2 }),
        currency: text("currency").default("EUR"),
        pricing_type: pricingTypeEnum("pricing_type").notNull().default("FIXED"),

        // Location & Logistics
        country: text("country").default("XK").notNull(),
        city: text("city"),
        region: text("region"),
        location_details: text("location_details"),
        delivery_options: text("delivery_options").array(),

        // Eco Features
        eco_labels: text("eco_labels").array().default(sql`ARRAY[]::text[]`),
        certifications: text("certifications").array().default(sql`ARRAY[]::text[]`),
        eco_score: integer("eco_score"),

        // Tags & Discovery
        tags: text("tags").array().default(sql`ARRAY[]::text[]`).notNull(),

        // Metadata
        metadata: jsonb("metadata").default(sql`'{}'::jsonb`),

        // Moderation & Trust
        status: listingStatusEnum("status").notNull().default("DRAFT"),
        verification_status: verificationStatusEnum("verification_status")
            .notNull()
            .default("UNVERIFIED"),
        verification_source: text("verification_source"),
        is_featured: boolean("is_featured").default(false).notNull(),

        // Visibility
        visibility: visibilityEnum("visibility").notNull().default("PUBLIC"),

        // Metrics
        view_count: integer("view_count").default(0).notNull(),
        contact_count: integer("contact_count").default(0).notNull(),

        // Timestamps
        created_at: timestamp("created_at", { withTimezone: true })
            .default(sql`now()`)
            .notNull(),
        updated_at: timestamp("updated_at", { withTimezone: true })
            .default(sql`now()`)
            .notNull(),
        expires_at: timestamp("expires_at", { withTimezone: true }),
    },
    (table) => ({
        categoryIdx: index("eco_listings_category_idx").on(table.category_id),
        flowTypeIdx: index("eco_listings_flow_type_idx").on(table.flow_type),
        statusIdx: index("eco_listings_status_idx").on(table.status),
        locationIdx: index("eco_listings_location_idx").on(table.city, table.region),
        createdAtIdx: index("eco_listings_created_at_idx").on(table.created_at),
    })
)

// ============================================================================
// ECO LISTING MEDIA - Images and attachments
// ============================================================================
export const ecoListingMedia = pgTable(
    "eco_listing_media",
    {
        id: uuid("id").primaryKey().defaultRandom().notNull(),
        listing_id: uuid("listing_id")
            .references(() => ecoListings.id, { onDelete: "cascade" })
            .notNull(),

        // Media Details
        url: text("url").notNull(),
        storage_path: text("storage_path"),
        file_type: text("file_type").notNull(),
        mime_type: text("mime_type"),
        file_size: integer("file_size"),

        // Display
        is_primary: boolean("is_primary").default(false),
        sort_order: integer("sort_order").default(0).notNull(),
        alt_text: text("alt_text"),
        caption: text("caption"),

        created_at: timestamp("created_at", { withTimezone: true })
            .default(sql`now()`)
            .notNull(),
    },
    (table) => ({
        listingIdx: index("eco_listing_media_listing_idx").on(table.listing_id),
    })
)

// ============================================================================
// ECO LISTING INTERACTIONS - User activity tracking
// ============================================================================
export const ecoListingInteractions = pgTable(
    "eco_listing_interactions",
    {
        id: uuid("id").primaryKey().defaultRandom().notNull(),
        listing_id: uuid("listing_id")
            .references(() => ecoListings.id, { onDelete: "cascade" })
            .notNull(),
        user_id: uuid("user_id")
            .references(() => users.id, { onDelete: "cascade" })
            .notNull(),

        interaction_type: interactionTypeEnum("interaction_type").notNull(),
        metadata: jsonb("metadata").default(sql`'{}'::jsonb`),

        created_at: timestamp("created_at", { withTimezone: true })
            .default(sql`now()`)
            .notNull(),
    },
    (table) => ({
        listingUserIdx: index("eco_listing_interactions_listing_user_idx").on(
            table.listing_id,
            table.user_id
        ),
        uniqueSave: uniqueIndex("eco_listing_interactions_save_unique")
            .on(table.listing_id, table.user_id, table.interaction_type)
            .where(sql`interaction_type = 'SAVE'`),
    })
)

// ============================================================================
// TYPE EXPORTS
// ============================================================================
export type EcoListing = typeof ecoListings.$inferSelect
export type EcoCategory = typeof ecoCategories.$inferSelect
export type EcoOrganization = typeof ecoOrganizations.$inferSelect
export type EcoListingMedia = typeof ecoListingMedia.$inferSelect
export type EcoListingInteraction = typeof ecoListingInteractions.$inferSelect
