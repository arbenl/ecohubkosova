-- ============================================================================
-- Marketplace V2 Schema - Eco-First Circular Economy Platform
-- Created: 2025-11-22
-- NOTE: This does NOT modify or drop any V1 tables (tregu_listime, etc.)
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE flow_type AS ENUM (
  'OFFER_WASTE',
  'OFFER_MATERIAL',
  'OFFER_RECYCLED_PRODUCT',
  'REQUEST_MATERIAL',
  'SERVICE_REPAIR',
  'SERVICE_REFURBISH',
  'SERVICE_COLLECTION',
  'SERVICE_CONSULTING',
  'SERVICE_OTHER'
);

CREATE TYPE condition AS ENUM (
  'NEW',
  'USED_EXCELLENT',
  'USED_GOOD',
  'USED_FAIR',
  'USED_REPAIRABLE',
  'SCRAP',
  'WASTE_STREAM'
);

CREATE TYPE lifecycle_stage AS ENUM (
  'RAW_MATERIAL',
  'COMPONENT',
  'SEMIFINISHED',
  'FINISHED_PRODUCT',
  'END_OF_LIFE',
  'WASTE'
);

CREATE TYPE pricing_type AS ENUM (
  'FIXED',
  'NEGOTIABLE',
  'FREE',
  'BARTER',
  'ON_REQUEST'
);

CREATE TYPE org_role AS ENUM (
  'PRODUCER',
  'RECYCLER',
  'COLLECTOR',
  'RESELLER',
  'SERVICE_PROVIDER',
  'PUBLIC_INSTITUTION',
  'NGO',
  'RESEARCH'
);

CREATE TYPE verification_status AS ENUM (
  'UNVERIFIED',
  'PENDING',
  'VERIFIED',
  'REJECTED'
);

CREATE TYPE listing_status AS ENUM (
  'DRAFT',
  'ACTIVE',
  'SOLD',
  'FULFILLED',
  'ARCHIVED',
  'REJECTED'
);

CREATE TYPE visibility AS ENUM (
  'PUBLIC',
  'MEMBERS_ONLY',
  'PRIVATE'
);

CREATE TYPE delivery_option AS ENUM (
  'PICKUP_ONLY',
  'LOCAL_DELIVERY',
  'REGIONAL_DELIVERY',
  'NATIONAL_SHIPPING'
);

CREATE TYPE interaction_type AS ENUM (
  'VIEW',
  'SAVE',
  'CONTACT',
  'SHARE'
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- Categories Table
CREATE TABLE eco_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES eco_categories(id) ON DELETE CASCADE,
  
  -- Content (i18n)
  slug TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL,
  name_sq TEXT NOT NULL,
  description_en TEXT,
  description_sq TEXT,
  
  -- Display
  icon_key TEXT,
  color TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Hierarchy
  level INTEGER NOT NULL DEFAULT 0,
  path TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX eco_categories_parent_idx ON eco_categories(parent_id);
CREATE INDEX eco_categories_slug_idx ON eco_categories(slug);

-- Organizations Table
CREATE TABLE eco_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Business Role
  org_role org_role NOT NULL,
  
  -- Verification
  verification_status verification_status NOT NULL DEFAULT 'UNVERIFIED',
  verification_source TEXT,
  verified_at TIMESTAMPTZ,
  verified_by_user_id UUID REFERENCES users(id),
  
  -- Eco Credentials
  certifications TEXT[] DEFAULT '{}',
  licenses TEXT[] DEFAULT '{}',
  
  -- Business Details
  waste_types_handled TEXT[],
  service_areas TEXT[],
  processing_capacity TEXT,
  
  -- Logistics
  pickup_available BOOLEAN DEFAULT false,
  delivery_available BOOLEAN DEFAULT false,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Stats
  total_listings INTEGER NOT NULL DEFAULT 0,
  total_transactions INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Listings Table
CREATE TABLE eco_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationships
  created_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES eco_organizations(id) ON DELETE SET NULL,
  category_id UUID NOT NULL REFERENCES eco_categories(id) ON DELETE RESTRICT,
  
  -- Core Content
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Circular Economy Classification
  flow_type flow_type NOT NULL,
  condition condition,
  lifecycle_stage lifecycle_stage,
  
  -- Quantity & Units
  quantity NUMERIC(10, 2),
  unit TEXT,
  
  -- Pricing
  price NUMERIC(10, 2),
  currency TEXT DEFAULT 'EUR',
  pricing_type pricing_type NOT NULL DEFAULT 'FIXED',
  
  -- Location & Logistics
  country TEXT NOT NULL DEFAULT 'XK',
  city TEXT,
  region TEXT,
  location_details TEXT,
  delivery_options TEXT[],
  
  -- Eco Features
  eco_labels TEXT[] DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',
  eco_score INTEGER,
  
  -- Tags & Discovery
  tags TEXT[] NOT NULL DEFAULT '{}',
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Moderation & Trust
  status listing_status NOT NULL DEFAULT 'DRAFT',
  verification_status verification_status NOT NULL DEFAULT 'UNVERIFIED',
  verification_source TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  
  -- Visibility
  visibility visibility NOT NULL DEFAULT 'PUBLIC',
  
  -- Metrics
  view_count INTEGER NOT NULL DEFAULT 0,
  contact_count INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX eco_listings_category_idx ON eco_listings(category_id);
CREATE INDEX eco_listings_flow_type_idx ON eco_listings(flow_type);
CREATE INDEX eco_listings_status_idx ON eco_listings(status);
CREATE INDEX eco_listings_location_idx ON eco_listings(city, region);
CREATE INDEX eco_listings_created_at_idx ON eco_listings(created_at);

-- Listing Media Table
CREATE TABLE eco_listing_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES eco_listings(id) ON DELETE CASCADE,
  
  -- Media Details
  url TEXT NOT NULL,
  storage_path TEXT,
  file_type TEXT NOT NULL,
  mime_type TEXT,
  file_size INTEGER,
  
  -- Display
  is_primary BOOLEAN DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  alt_text TEXT,
  caption TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX eco_listing_media_listing_idx ON eco_listing_media(listing_id);

-- Listing Interactions Table
CREATE TABLE eco_listing_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES eco_listings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  interaction_type interaction_type NOT NULL,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX eco_listing_interactions_listing_user_idx ON eco_listing_interactions(listing_id, user_id);
CREATE UNIQUE INDEX eco_listing_interactions_save_unique 
  ON eco_listing_interactions(listing_id, user_id, interaction_type) 
  WHERE interaction_type = 'SAVE';

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE eco_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE eco_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE eco_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE eco_listing_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE eco_listing_interactions ENABLE ROW LEVEL SECURITY;

-- Categories: Public read, admin write
CREATE POLICY "Public can view active categories" ON eco_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can view all categories" ON eco_categories
  FOR SELECT TO authenticated USING (true);

-- Organizations: Public read for verified, members can update
CREATE POLICY "Public can view verified eco organizations" ON eco_organizations
  FOR SELECT USING (verification_status = 'VERIFIED');

CREATE POLICY "Org members can update their eco organization" ON eco_organizations
  FOR UPDATE TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Listings: Public read for active/public, users manage their own
CREATE POLICY "Public can view active public listings" ON eco_listings
  FOR SELECT USING (
    status = 'ACTIVE' 
    AND visibility = 'PUBLIC'
  );

CREATE POLICY "Authenticated users can create listings" ON eco_listings
  FOR INSERT TO authenticated
  WITH CHECK (created_by_user_id = auth.uid());

CREATE POLICY "Users can update their own listings" ON eco_listings
  FOR UPDATE TO authenticated
  USING (created_by_user_id = auth.uid());

CREATE POLICY "Org members can update org listings" ON eco_listings
  FOR UPDATE TO authenticated
  USING (
    organization_id IN (
      SELECT eco_organizations.id FROM eco_organizations
      INNER JOIN organization_members ON eco_organizations.organization_id = organization_members.organization_id
      WHERE organization_members.user_id = auth.uid()
    )
  );

-- Media: Inherit from listing permissions
CREATE POLICY "Users can view media for visible listings" ON eco_listing_media
  FOR SELECT USING (
    listing_id IN (
      SELECT id FROM eco_listings
      WHERE status = 'ACTIVE' AND visibility = 'PUBLIC'
    )
  );

CREATE POLICY "Users can manage media for their listings" ON eco_listing_media
  FOR ALL TO authenticated
  USING (
    listing_id IN (
      SELECT id FROM eco_listings
      WHERE created_by_user_id = auth.uid()
    )
  );

-- Interactions: Users manage their own
CREATE POLICY "Users can view their own interactions" ON eco_listing_interactions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create interactions" ON eco_listing_interactions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- SEED DATA - Basic Categories
-- ============================================================================

INSERT INTO eco_categories (slug, name_en, name_sq, level, path, is_featured, sort_order) VALUES
  ('materials', 'Materials', 'Materiale', 0, 'materials', true, 1),
  ('products', 'Products', 'Produkte', 0, 'products', true, 2),
  ('services', 'Services', 'Shërbime', 0, 'services', true, 3);

-- Materials subcategories
INSERT INTO eco_categories (parent_id, slug, name_en, name_sq, level, path, sort_order)
SELECT 
  id,
  'materials-' || unnest(ARRAY['metals', 'plastics', 'paper', 'textiles', 'glass', 'electronics', 'organic']),
  unnest(ARRAY['Metals', 'Plastics', 'Paper & Cardboard', 'Textiles', 'Glass', 'Electronics', 'Organic Waste']),
  unnest(ARRAY['Metale', 'Plastika', 'Letër dhe Karton', 'Tekstile', 'Xham', 'Elektronikë', 'Mbetje Organike']),
  1,
  'materials/' || unnest(ARRAY['metals', 'plastics', 'paper', 'textiles', 'glass', 'electronics', 'organic']),
  unnest(ARRAY[1, 2, 3, 4, 5, 6, 7])
FROM eco_categories WHERE slug = 'materials';

-- Products subcategories
INSERT INTO eco_categories (parent_id, slug, name_en, name_sq, level, path, sort_order)
SELECT 
  id,
  'products-' || unnest(ARRAY['furniture', 'clothing', 'appliances', 'construction', 'packaging']),
  unnest(ARRAY['Furniture', 'Clothing & Accessories', 'Appliances', 'Construction Materials', 'Packaging']),
  unnest(ARRAY['Mobilje', 'Veshje dhe Aksesorë', 'Pajisje Shtëpiake', 'Materiale Ndërtimi', 'Paketim']),
  1,
  'products/' || unnest(ARRAY['furniture', 'clothing', 'appliances', 'construction', 'packaging']),
  unnest(ARRAY[1, 2, 3, 4, 5])
FROM eco_categories WHERE slug = 'products';

-- Services subcategories
INSERT INTO eco_categories (parent_id, slug, name_en, name_sq, level, path, sort_order)
SELECT 
  id,
  'services-' || unnest(ARRAY['repair', 'refurbish', 'collection', 'recycling', 'consulting']),
  unnest(ARRAY['Repair', 'Refurbishment', 'Waste Collection', 'Recycling', 'Eco Consulting']),
  unnest(ARRAY['Riparim', 'Rinovim', 'Grumbullim Mbeturinash', 'Riciklim', 'Konsulencë Eko']),
  1,
  'services/' || unnest(ARRAY['repair', 'refurbish', 'collection', 'recycling', 'consulting']),
  unnest(ARRAY[1, 2, 3, 4, 5])
FROM eco_categories WHERE slug = 'services';
