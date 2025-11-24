-- ============================================================================
-- Seed: Kosovo Demo Eco Listings
-- Created: 2025-11-23
-- Description: Inserts 6 realistic demo listings into eco_listings table
--              showcasing Kosovo's circular economy ecosystem.
--              Uses fixed UUIDs and ON CONFLICT for idempotency.
-- ============================================================================

-- First, ensure we have the specific categories we need
-- These will be upserted (INSERT ... ON CONFLICT UPDATE) for safety

INSERT INTO eco_categories (slug, name_en, name_sq, level, path, sort_order, is_active, is_featured)
VALUES
  ('recycled-metals', 'Recycled Metals', 'Metale të Ricikluara', 0, 'recycled-metals', 10, true, true),
  ('plastic-packaging', 'Plastic & Packaging', 'Plastikë & Ambalazh', 0, 'plastic-packaging', 11, true, true),
  ('ewaste', 'Electronics & E-waste', 'Pajisje Elektrike & Elektronike', 0, 'ewaste', 12, true, true),
  ('wood-pallets', 'Wood Pallets & Timber', 'Paleta & Dru Teknik', 0, 'wood-pallets', 13, true, true),
  ('textiles-light', 'Textiles & Light Materials', 'Tekstile & Materiale të Lehta', 0, 'textiles-light', 14, true, true)
ON CONFLICT (slug) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_sq = EXCLUDED.name_sq,
  is_active = true;

-- ============================================================================
-- DEMO LISTINGS
-- ============================================================================

-- Listing 1: REC-KOS - Mixed Scrap Metals (Prishtinë / Fushë Kosovë)
INSERT INTO eco_listings (
  id,
  created_by_user_id,
  organization_id,
  category_id,
  title,
  description,
  flow_type,
  condition,
  lifecycle_stage,
  quantity,
  unit,
  price,
  currency,
  pricing_type,
  country,
  city,
  region,
  location_details,
  eco_labels,
  tags,
  status,
  visibility,
  verification_status,
  is_featured,
  metadata
)
SELECT
  '11111111-1111-1111-1111-111111111111'::uuid,
  (SELECT id FROM users LIMIT 1), -- Use first available user
  (SELECT eo.id FROM eco_organizations eo 
   JOIN organizations o ON eo.organization_id = o.id 
   WHERE o.name ILIKE '%REC-KOS%' LIMIT 1),
  (SELECT id FROM eco_categories WHERE slug = 'recycled-metals' LIMIT 1),
  'Metale të Përziera për Riciklim - Zona Industriale / Mixed Scrap Metals - Industrial Zone',
  'Metale skrapi të pastra dhe të ndara, të përshtatshme për riciklim nga zona industriale e Fushë Kosovës. Përfshijnë hekur, alumin dhe metale të tjera jo-ferroze. Cilësi e lartë, të gatshme për përpunim. Mundësi për marrje në vend me kamion.'
    || E'\n\nEnglish: Clean, separated scrap metals ready for recycling from the industrial zone in Fushë Kosovë (iron, aluminum, non-ferrous). Truck pickup available.',
  'OFFER_WASTE'::flow_type,
  'SCRAP'::condition,
  'END_OF_LIFE'::lifecycle_stage,
  25.00,
  'TON',
  140.00,
  'EUR',
  'NEGOTIABLE'::pricing_type,
  'XK',
  'Prishtinë',
  'Prishtinë',
  'Zona Industriale, Fushë Kosovë - pranë rrugës kryesore',
  ARRAY['RECYCLABLE', 'LOCAL_SOURCE', 'SEPARATED_AT_SOURCE']::text[],
  ARRAY['metale', 'riciklim', 'skrap', 'industri', 'prishtinë']::text[],
  'ACTIVE'::listing_status,
  'PUBLIC'::visibility,
  'VERIFIED'::verification_status,
  true,
  jsonb_build_object(
    'phone', '+383 38 500 700',
    'pickup_available', true,
    'min_quantity', '5 TON',
    'service_areas', ARRAY['Prishtinë', 'Fushë Kosovë', 'Obiliq']
  )
WHERE NOT EXISTS (SELECT 1 FROM eco_listings WHERE id = '11111111-1111-1111-1111-111111111111');

-- Listing 2: PLASTIKA - Baled PET Bottles (Ferizaj)
INSERT INTO eco_listings (
  id,
  created_by_user_id,
  organization_id,
  category_id,
  title,
  description,
  flow_type,
  condition,
  lifecycle_stage,
  quantity,
  unit,
  price,
  currency,
  pricing_type,
  country,
  city,
  region,
  location_details,
  eco_labels,
  tags,
  status,
  visibility,
  verification_status,
  is_featured,
  metadata
)
SELECT
  '22222222-2222-2222-2222-222222222222'::uuid,
  (SELECT id FROM users LIMIT 1),
  (SELECT eo.id FROM eco_organizations eo 
   JOIN organizations o ON eo.organization_id = o.id 
   WHERE o.name ILIKE '%PLASTIKA%' LIMIT 1),
  (SELECT id FROM eco_categories WHERE slug = 'plastic-packaging' LIMIT 1),
  'Bala PET nga Rrjeti i Supermarketeve - Ferizaj / PET bales from supermarkets - Ferizaj',
  'Bala PET të para-selektuara nga rrjeti i supermarketeve lokale në Ferizaj. Shishe plastike të pastra, të ngjeshura dhe të gatshme për riciklim. Cilësi e mirë, pa ndotje. Furnizim i rregullt mujor. Transport i disponueshëm brenda rajonit.'
    || E'\n\nEnglish: Clean, compressed PET bottle bales from a supermarket network in Ferizaj. Ready for recycling with regular monthly supply and regional delivery.',
  'OFFER_WASTE'::flow_type,
  'USED_GOOD'::condition,
  'END_OF_LIFE'::lifecycle_stage,
  8.00,
  'TON',
  120.00,
  'EUR',
  'NEGOTIABLE'::pricing_type,
  'XK',
  'Ferizaj',
  'Ferizaj',
  'Qendra e Grumbullimit, Ferizaj - pranë autostradës',
  ARRAY['RECYCLABLE', 'SEPARATED_AT_SOURCE', 'CLEAN']::text[],
  ARRAY['plastikë', 'PET', 'riciklim', 'ferizaj', 'supermarket']::text[],
  'ACTIVE'::listing_status,
  'PUBLIC'::visibility,
  'VERIFIED'::verification_status,
  true,
  jsonb_build_object(
    'phone', '+383 38 500 701',
    'delivery_available', true,
    'supply_frequency', 'monthly',
    'service_areas', ARRAY['Ferizaj', 'Gjilan', 'Kaçanik']
  )
WHERE NOT EXISTS (SELECT 1 FROM eco_listings WHERE id = '22222222-2222-2222-2222-222222222222');

-- Listing 3: ECO KOS - Request for Textile Offcuts (Prizren)
INSERT INTO eco_listings (
  id,
  created_by_user_id,
  organization_id,
  category_id,
  title,
  description,
  flow_type,
  condition,
  lifecycle_stage,
  quantity,
  unit,
  price,
  currency,
  pricing_type,
  country,
  city,
  region,
  location_details,
  eco_labels,
  tags,
  status,
  visibility,
  verification_status,
  is_featured,
  metadata
)
SELECT
  '33333333-3333-3333-3333-333333333333'::uuid,
  (SELECT id FROM users LIMIT 1),
  (SELECT eo.id FROM eco_organizations eo 
   JOIN organizations o ON eo.organization_id = o.id 
   WHERE o.name ILIKE '%ECO KOS%' LIMIT 1),
  (SELECT id FROM eco_categories WHERE slug = 'textiles-light' LIMIT 1),
  'Kërkohen Mbetje Tekstili për Upcycling - Prizren / Textile offcuts wanted for upcycling - Prizren',
  'Ndërmarrja sociale ECO KOS kërkon mbetje tekstili dhe copëza pëlhure nga punëtoritë dhe fabrikat e veshjeve në Prizren dhe rrethinë. Materialet do të përdoren për prodhimin e produkteve të upcycling-ut dhe materialeve izoluese. Pranojmë sasi të vogla dhe të mëdha. Shërbim falas i grumbullimit.'
    || E'\n\nEnglish: Social enterprise ECO KOS needs textile scraps and offcuts for upcycling and insulation products. Free pickup around Prizren; small and large quantities accepted.',
  'REQUEST_MATERIAL'::flow_type,
  NULL, -- No condition for requests
  'WASTE'::lifecycle_stage,
  500.00,
  'KG',
  NULL, -- No price - they accept waste for free
  'EUR',
  'FREE'::pricing_type,
  'XK',
  'Prizren',
  'Prizren',
  'Qendra e Upcycling, Prizren - zona e vjetër industriale',
  ARRAY['UPCYCLING', 'SOCIAL_ENTERPRISE', 'CIRCULAR_ECONOMY']::text[],
  ARRAY['tekstile', 'upcycling', 'prizren', 'social', 'mbetje']::text[],
  'ACTIVE'::listing_status,
  'PUBLIC'::visibility,
  'VERIFIED'::verification_status,
  true,
  jsonb_build_object(
    'phone', '+383 38 500 702',
    'pickup_available', true,
    'accepts_small_quantities', true,
    'service_areas', ARRAY['Prizren', 'Dragash', 'Suharekë']
  )
WHERE NOT EXISTS (SELECT 1 FROM eco_listings WHERE id = '33333333-3333-3333-3333-333333333333');

-- Listing 4: POWERPACK - Pallet Repair & Buy-back Service (Prishtinë)
INSERT INTO eco_listings (
  id,
  created_by_user_id,
  organization_id,
  category_id,
  title,
  description,
  flow_type,
  condition,
  lifecycle_stage,
  quantity,
  unit,
  price,
  currency,
  pricing_type,
  country,
  city,
  region,
  location_details,
  eco_labels,
  tags,
  status,
  visibility,
  verification_status,
  is_featured,
  metadata
)
SELECT
  '44444444-4444-4444-4444-444444444444'::uuid,
  (SELECT id FROM users LIMIT 1),
  (SELECT eo.id FROM eco_organizations eo 
   JOIN organizations o ON eo.organization_id = o.id 
   WHERE o.name ILIKE '%POWERPACK%' LIMIT 1),
  (SELECT id FROM eco_categories WHERE slug = 'wood-pallets' LIMIT 1),
  'Shërbim Riparimi dhe Blerje e Paletave - Prishtinë / Pallet repair & buy-back - Prishtina',
  'POWERPACK ofron shërbim profesional të riparimit dhe programin e blerjes së paletave druri nga magazinat logjistike. Pranojmë paleta të dëmtuara për riparim ose blerje. Çmim konkurrues, shërbim i shpejtë. Kontriboni në ekonominë qarkulluese duke ripërdorur paletat tuaja.'
    || E'\n\nEnglish: POWERPACK repairs and buys back wooden pallets from logistics warehouses. Competitive pricing and fast service to keep pallets in circular use.',
  'SERVICE_REPAIR'::flow_type,
  'USED_REPAIRABLE'::condition,
  'END_OF_LIFE'::lifecycle_stage,
  500.00,
  'PIECES',
  3.00,
  'EUR',
  'NEGOTIABLE'::pricing_type,
  'XK',
  'Prishtinë',
  'Prishtinë',
  'Qendra Logjistike, Fushë Kosovë - pranë aeroportit',
  ARRAY['REUSE', 'CIRCULAR_LOGISTICS', 'REPAIR']::text[],
  ARRAY['paleta', 'dru', 'riparim', 'logjistikë', 'prishtinë']::text[],
  'ACTIVE'::listing_status,
  'PUBLIC'::visibility,
  'VERIFIED'::verification_status,
  true,
  jsonb_build_object(
    'phone', '+383 290 42 100',
    'pickup_available', true,
    'min_quantity', '50 pieces',
    'service_areas', ARRAY['Prishtinë', 'Fushë Kosovë', 'Lipjan', 'Podujevë']
  )
WHERE NOT EXISTS (SELECT 1 FROM eco_listings WHERE id = '44444444-4444-4444-4444-444444444444');

-- Listing 5: EUROGOMA - Used Tires Collection (Ferizaj)
INSERT INTO eco_listings (
  id,
  created_by_user_id,
  organization_id,
  category_id,
  title,
  description,
  flow_type,
  condition,
  lifecycle_stage,
  quantity,
  unit,
  price,
  currency,
  pricing_type,
  country,
  city,
  region,
  location_details,
  eco_labels,
  tags,
  status,
  visibility,
  verification_status,
  is_featured,
  metadata
)
SELECT
  '55555555-5555-5555-5555-555555555555'::uuid,
  (SELECT id FROM users LIMIT 1),
  (SELECT eo.id FROM eco_organizations eo 
   JOIN organizations o ON eo.organization_id = o.id 
   WHERE o.name ILIKE '%EUROGOMA%' LIMIT 1),
  (SELECT id FROM eco_categories WHERE slug = 'materials-' || 'organic' LIMIT 1), -- Reuse existing category
  'Grumbullim Gomash të Përdorura - Ferizaj / Used tyre collection - Ferizaj',
  'EUROGOMA pranon goma të përdorura nga automjetet për riciklim profesional. Përpunim i sigurt dhe ekologjik i gomave në fund të jetës. Shërbim falas i grumbullimit për sasi mbi 100 copa. Certifikatë e disponueshme për asgjësim të rregullt.'
    || E'\n\nEnglish: EUROGOMA collects used vehicle tyres for professional recycling. Free pickup for 100+ pieces and certified end-of-life processing.',
  'SERVICE_COLLECTION'::flow_type,
  'SCRAP'::condition,
  'END_OF_LIFE'::lifecycle_stage,
  1000.00,
  'PIECES',
  NULL,
  'EUR',
  'FREE'::pricing_type,
  'XK',
  'Ferizaj',
  'Ferizaj',
  'Qendra e Riciklimit, Ferizaj - zona industriale',
  ARRAY['RECYCLING', 'ENVIRONMENTAL_PROTECTION', 'CERTIFIED']::text[],
  ARRAY['goma', 'riciklim', 'ferizaj', 'automjete', 'mjedis']::text[],
  'ACTIVE'::listing_status,
  'PUBLIC'::visibility,
  'UNVERIFIED'::verification_status,
  false,
  jsonb_build_object(
    'phone', '+383 290 44 345',
    'pickup_available', true,
    'min_quantity_for_free_pickup', '100 pieces',
    'service_areas', ARRAY['Ferizaj', 'Gjilan', 'Shtërpcë', 'Kaçanik']
  )
WHERE NOT EXISTS (SELECT 1 FROM eco_listings WHERE id = '55555555-5555-5555-5555-555555555555');

-- Listing 6: SIMPLY GREEN - Organic Waste Composting Service (Mitrovica)
INSERT INTO eco_listings (
  id,
  created_by_user_id,
  organization_id,
  category_id,
  title,
  description,
  flow_type,
  condition,
  lifecycle_stage,
  quantity,
  unit,
  price,
  currency,
  pricing_type,
  country,
  city,
  region,
  location_details,
  eco_labels,
  tags,
  status,
  visibility,
  verification_status,
  is_featured,
  metadata
)
SELECT
  '66666666-6666-6666-6666-666666666666'::uuid,
  (SELECT id FROM users LIMIT 1),
  (SELECT eo.id FROM eco_organizations eo 
   JOIN organizations o ON eo.organization_id = o.id 
   WHERE o.name ILIKE '%SIMPLY GREEN%' LIMIT 1),
  (SELECT id FROM eco_categories WHERE slug = 'materials-organic' LIMIT 1),
  'Shërbim Kompostimi për Mbetje Organike - Mitrovicë / Organic waste composting - Mitrovica',
  'SIMPLY GREEN ofron shërbim profesional të kompostimit për mbetje organike nga restorantet, hotelet dhe fermat në Mitrovicë dhe rrethinë. Transformojmë mbetjet organike në kompost cilësor. Kontriboni në uljen e mbetjeve dhe prodhimin e plehut natyror. Çmime konkurruese për kontrata mujore.'
    || E'\n\nEnglish: SIMPLY GREEN composts organic waste from restaurants, hotels, and farms around Mitrovica. Turns waste into quality compost with competitive monthly contracts.',
  'SERVICE_OTHER'::flow_type,
  NULL,
  'WASTE'::lifecycle_stage,
  10.00,
  'TON',
  50.00,
  'EUR',
  'FIXED'::pricing_type,
  'XK',
  'Mitrovicë',
  'Mitrovicë',
  'Qendra e Kompostimit, Mitrovicë - zona jugore',
  ARRAY['COMPOSTING', 'ORGANIC', 'CIRCULAR_ECONOMY', 'CLIMATE_POSITIVE']::text[],
  ARRAY['kompost', 'organike', 'mitrovicë', 'mjedis', 'bujqësi']::text[],
  'ACTIVE'::listing_status,
  'PUBLIC'::visibility,
  'UNVERIFIED'::verification_status,
  false,
  jsonb_build_object(
    'phone', '+383 290 55 300',
    'pickup_available', true,
    'monthly_contracts_available', true,
    'service_areas', ARRAY['Mitrovicë', 'Vushtrri', 'Skenderaj']
  )
WHERE NOT EXISTS (SELECT 1 FROM eco_listings WHERE id = '66666666-6666-6666-6666-666666666666');

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Log the results
DO $$
DECLARE
  listing_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO listing_count FROM eco_listings 
  WHERE id IN (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444444',
    '55555555-5555-5555-5555-555555555555',
    '66666666-6666-6666-6666-666666666666'
  );
  
  RAISE NOTICE 'Kosovo demo listings seed complete. Total demo listings: %', listing_count;
END $$;
