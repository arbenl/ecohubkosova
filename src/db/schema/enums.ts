// src/db/schema/enums.ts
// Marketplace V2 Enums

import { pgEnum } from "drizzle-orm/pg-core"

// Flow Type - What is the listing for?
export const flowTypeEnum = pgEnum("flow_type", [
    "OFFER_WASTE",
    "OFFER_MATERIAL",
    "OFFER_RECYCLED_PRODUCT",
    "REQUEST_MATERIAL",
    "SERVICE_REPAIR",
    "SERVICE_REFURBISH",
    "SERVICE_COLLECTION",
    "SERVICE_CONSULTING",
    "SERVICE_OTHER",
])

// Condition
export const conditionEnum = pgEnum("condition", [
    "NEW",
    "USED_EXCELLENT",
    "USED_GOOD",
    "USED_FAIR",
    "USED_REPAIRABLE",
    "SCRAP",
    "WASTE_STREAM",
])

// Lifecycle Stage
export const lifecycleStageEnum = pgEnum("lifecycle_stage", [
    "RAW_MATERIAL",
    "COMPONENT",
    "SEMIFINISHED",
    "FINISHED_PRODUCT",
    "END_OF_LIFE",
    "WASTE",
])

// Pricing Type
export const pricingTypeEnum = pgEnum("pricing_type", [
    "FIXED",
    "NEGOTIABLE",
    "FREE",
    "BARTER",
    "ON_REQUEST",
])

// Organization Role
export const orgRoleEnum = pgEnum("org_role", [
    "PRODUCER",
    "RECYCLER",
    "COLLECTOR",
    "RESELLER",
    "SERVICE_PROVIDER",
    "PUBLIC_INSTITUTION",
    "NGO",
    "RESEARCH",
])

// Verification Status
export const verificationStatusEnum = pgEnum("verification_status", [
    "UNVERIFIED",
    "PENDING",
    "VERIFIED",
    "REJECTED",
])

// Listing Status
export const listingStatusEnum = pgEnum("listing_status", [
    "DRAFT",
    "ACTIVE",
    "SOLD",
    "FULFILLED",
    "ARCHIVED",
    "REJECTED",
])

// Visibility
export const visibilityEnum = pgEnum("visibility", [
    "PUBLIC",
    "MEMBERS_ONLY",
    "PRIVATE",
])

// Delivery Options (will be used as array)
export const deliveryOptionEnum = pgEnum("delivery_option", [
    "PICKUP_ONLY",
    "LOCAL_DELIVERY",
    "REGIONAL_DELIVERY",
    "NATIONAL_SHIPPING",
])

// Interaction Type
export const interactionTypeEnum = pgEnum("interaction_type", [
    "VIEW",
    "SAVE",
    "CONTACT",
    "SHARE",
])
