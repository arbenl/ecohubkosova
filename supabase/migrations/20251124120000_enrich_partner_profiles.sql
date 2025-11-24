-- ============================================================================
-- Migration: Enrich partner profiles with richer public-facing metadata
-- Date: 2025-11-24
-- Notes:
--   - Targets existing Kosovo eco partners seeded earlier.
--   - Updates are idempotent: each statement is scoped by name ILIKE filters.
--   - Uses jsonb_strip_nulls + COALESCE to merge new metadata with existing.
--   - Focuses on public-facing facts (sector, website, service areas, tags).
-- ============================================================================

-- REC-KOS (metal recycling, Prishtina)
UPDATE organizations
SET
  description = 'Metal recycling facility processing ferrous and non‑ferrous scrap for industrial reuse.',
  location = 'Prishtina, Kosovo',
  primary_interest = 'Metal Recycling'
WHERE name ILIKE 'REC-KOS%';

UPDATE eco_organizations eo
SET
  waste_types_handled = ARRAY['Ferrous metals', 'Non-ferrous metals', 'Aluminum scrap'],
  service_areas = ARRAY['Prishtina', 'Fushë Kosovë', 'Mitrovica'],
  metadata = jsonb_strip_nulls(
    COALESCE(eo.metadata, '{}'::jsonb) ||
    jsonb_build_object(
      'sector', 'Metal recycling & scrap processing'
    )
  )
FROM organizations o
WHERE eo.organization_id = o.id
  AND o.name ILIKE 'REC-KOS%';

-- PLASTIKA (plastic recycling, Prishtina)
UPDATE organizations
SET
  description = 'Plastic waste collection and processing for PET, HDPE and LDPE streams.',
  location = 'Prishtina, Kosovo',
  primary_interest = 'Plastic Recycling'
WHERE name ILIKE 'PLASTIKA%';

UPDATE eco_organizations eo
SET
  waste_types_handled = ARRAY['PET bottles', 'HDPE', 'LDPE film', 'Mixed plastics'],
  service_areas = ARRAY['Prishtina', 'Gjilan', 'Ferizaj'],
  metadata = jsonb_strip_nulls(
    COALESCE(eo.metadata, '{}'::jsonb) ||
    jsonb_build_object(
      'sector', 'Plastic recycling & reprocessing'
    )
  )
FROM organizations o
WHERE eo.organization_id = o.id
  AND o.name ILIKE 'PLASTIKA%';

-- EUROGOMA (tire recycling, Ferizaj)
UPDATE organizations
SET
  description = 'End-of-life tire collection and granulation for rubber reuse.',
  location = 'Ferizaj, Kosovo',
  primary_interest = 'Tire Recycling'
WHERE name ILIKE 'EUROGOMA%';

UPDATE eco_organizations eo
SET
  waste_types_handled = ARRAY['End-of-life tires', 'Rubber granulate', 'Tire-derived fuel'],
  service_areas = ARRAY['Ferizaj', 'Prishtina', 'Gjilan'],
  metadata = jsonb_strip_nulls(
    COALESCE(eo.metadata, '{}'::jsonb) ||
    jsonb_build_object(
      'sector', 'Tire recycling & rubber recovery'
    )
  )
FROM organizations o
WHERE eo.organization_id = o.id
  AND o.name ILIKE 'EUROGOMA%';

-- ECO KOS (WEEE recycler, Prishtina)
UPDATE organizations
SET
  description = 'Certified WEEE recycler handling electronics, metals and plastics recovery.',
  location = 'Prishtina, Kosovo',
  primary_interest = 'WEEE Recycling'
WHERE name ILIKE 'ECO KOS%';

UPDATE eco_organizations eo
SET
  waste_types_handled = ARRAY['WEEE', 'Small electronics', 'Cables', 'Mixed metals'],
  service_areas = ARRAY['Prishtina', 'Mitrovica', 'Peja'],
  metadata = jsonb_strip_nulls(
    COALESCE(eo.metadata, '{}'::jsonb) ||
    jsonb_build_object(
      'sector', 'Electronics & WEEE recycling'
    )
  )
FROM organizations o
WHERE eo.organization_id = o.id
  AND o.name ILIKE 'ECO KOS%';

-- POWERPACK (battery recycling, Prizren)
UPDATE organizations
SET
  description = 'Battery collection and recycling facility handling lead-acid and lithium chemistries.',
  location = 'Prizren, Kosovo',
  primary_interest = 'Battery Recycling'
WHERE name ILIKE 'POWERPACK%';

UPDATE eco_organizations eo
SET
  waste_types_handled = ARRAY['Lead-acid batteries', 'Lithium batteries', 'Battery scrap'],
  service_areas = ARRAY['Prizren', 'Gjakova', 'Prishtina'],
  metadata = jsonb_strip_nulls(
    COALESCE(eo.metadata, '{}'::jsonb) ||
    jsonb_build_object(
      'sector', 'Battery recycling'
    )
  )
FROM organizations o
WHERE eo.organization_id = o.id
  AND o.name ILIKE 'POWERPACK%';

-- TE BLERIM LUZHA (collector, Peja)
UPDATE organizations
SET
  description = 'Regional waste collection and aggregation service supporting recyclers across Dukagjini.',
  location = 'Peja, Kosovo',
  primary_interest = 'Waste Collection'
WHERE name ILIKE 'TE BLERIM LUZHA%';

UPDATE eco_organizations eo
SET
  waste_types_handled = ARRAY['Mixed recyclables', 'Paper & cardboard', 'Plastics'],
  service_areas = ARRAY['Peja', 'Gjakova', 'Deçan'],
  metadata = jsonb_strip_nulls(
    COALESCE(eo.metadata, '{}'::jsonb) ||
    jsonb_build_object(
      'sector', 'Waste collection & logistics'
    )
  )
FROM organizations o
WHERE eo.organization_id = o.id
  AND o.name ILIKE 'TE BLERIM LUZHA%';

-- SIMPLY GREEN (organic waste, Mitrovica)
UPDATE organizations
SET
  description = 'Organic waste management and composting services for municipalities and businesses.',
  location = 'Mitrovica, Kosovo',
  primary_interest = 'Organic Waste Management'
WHERE name ILIKE 'SIMPLY GREEN%';

UPDATE eco_organizations eo
SET
  waste_types_handled = ARRAY['Organic waste', 'Green waste', 'Food scraps'],
  service_areas = ARRAY['Mitrovica', 'Skenderaj', 'Vushtrri'],
  metadata = jsonb_strip_nulls(
    COALESCE(eo.metadata, '{}'::jsonb) ||
    jsonb_build_object(
      'sector', 'Organic waste & composting'
    )
  )
FROM organizations o
WHERE eo.organization_id = o.id
  AND o.name ILIKE 'SIMPLY GREEN%';

-- KOSOVO GLASS RECYCLING (glass, Prishtina)
UPDATE organizations
SET
  description = 'Glass collection and cullet processing for reuse in construction and packaging.',
  location = 'Prishtina, Kosovo',
  primary_interest = 'Glass Recycling'
WHERE name ILIKE 'KOSOVO GLASS RECYCLING%';

UPDATE eco_organizations eo
SET
  waste_types_handled = ARRAY['Container glass', 'Flat glass', 'Mixed glass'],
  service_areas = ARRAY['Prishtina', 'Podujeva', 'Lipjan'],
  metadata = jsonb_strip_nulls(
    COALESCE(eo.metadata, '{}'::jsonb) ||
    jsonb_build_object(
      'sector', 'Glass recycling'
    )
  )
FROM organizations o
WHERE eo.organization_id = o.id
  AND o.name ILIKE 'KOSOVO GLASS RECYCLING%';

-- RICIKLIMI-ED (collector, Gjakova)
UPDATE organizations
SET
  description = 'Mixed recyclables collection and sorting service connecting local businesses with processors.',
  location = 'Gjakova, Kosovo',
  primary_interest = 'Mixed Recycling'
WHERE name ILIKE 'RICIKLIMI-ED%';

UPDATE eco_organizations eo
SET
  waste_types_handled = ARRAY['Paper & cardboard', 'Plastics', 'Metals'],
  service_areas = ARRAY['Gjakova', 'Rahovec', 'Prizren'],
  metadata = jsonb_strip_nulls(
    COALESCE(eo.metadata, '{}'::jsonb) ||
    jsonb_build_object(
      'sector', 'Recyclables collection & sorting'
    )
  )
FROM organizations o
WHERE eo.organization_id = o.id
  AND o.name ILIKE 'RICIKLIMI-ED%';

-- BIO 365 (organic, Prizren)
UPDATE organizations
SET
  description = 'Bioconversion and composting service turning agricultural and food waste into soil inputs.',
  location = 'Prizren, Kosovo',
  primary_interest = 'Organic Waste & Compost'
WHERE name ILIKE 'BIO 365%';

UPDATE eco_organizations eo
SET
  waste_types_handled = ARRAY['Agricultural waste', 'Food waste', 'Green waste'],
  service_areas = ARRAY['Prizren', 'Dragash', 'Suharekë'],
  metadata = jsonb_strip_nulls(
    COALESCE(eo.metadata, '{}'::jsonb) ||
    jsonb_build_object(
      'sector', 'Compost & bioconversion'
    )
  )
FROM organizations o
WHERE eo.organization_id = o.id
  AND o.name ILIKE 'BIO 365%';

-- UPCYCLE KOSOVO (textiles, Prishtina)
UPDATE organizations
SET
  description = 'Social enterprise upcycling textiles and clothing into new products with local artisans.',
  location = 'Prishtina, Kosovo',
  primary_interest = 'Textile Upcycling'
WHERE name ILIKE 'UPCYCLE KOSOVO%';

UPDATE eco_organizations eo
SET
  waste_types_handled = ARRAY['Textile offcuts', 'Used clothing', 'Fabric scraps'],
  service_areas = ARRAY['Prishtina', 'Fushë Kosovë', 'Lipjan'],
  metadata = jsonb_strip_nulls(
    COALESCE(eo.metadata, '{}'::jsonb) ||
    jsonb_build_object(
      'sector', 'Textile upcycling'
    )
  )
FROM organizations o
WHERE eo.organization_id = o.id
  AND o.name ILIKE 'UPCYCLE KOSOVO%';

-- EUROPEAN METAL RECYCLING (Obiliq)
UPDATE organizations
SET
  description = 'Scrap metal processing and export hub serving industrial clients in Kosovo.',
  location = 'Obiliq, Kosovo',
  primary_interest = 'Industrial Metal Recycling'
WHERE name ILIKE 'EUROPEAN METAL RECYCLING%';

UPDATE eco_organizations eo
SET
  waste_types_handled = ARRAY['Industrial scrap', 'Steel', 'Aluminum'],
  service_areas = ARRAY['Obiliq', 'Prishtina', 'Vushtrri'],
  metadata = jsonb_strip_nulls(
    COALESCE(eo.metadata, '{}'::jsonb) ||
    jsonb_build_object(
      'sector', 'Industrial scrap processing'
    )
  )
FROM organizations o
WHERE eo.organization_id = o.id
  AND o.name ILIKE 'EUROPEAN METAL RECYCLING%';

-- Kosovo Waste Management Ltd (logistics)
UPDATE organizations
SET
  description = 'Waste collection and logistics provider linking generators with certified recyclers.',
  location = 'Prizren, Kosovo',
  primary_interest = 'Waste Logistics'
WHERE name ILIKE 'Kosovo Waste Management Ltd%';

UPDATE eco_organizations eo
SET
  waste_types_handled = ARRAY['Mixed recyclables', 'Organic waste', 'Commercial waste'],
  service_areas = ARRAY['Prizren', 'Gjakova', 'Ferizaj', 'Prishtina'],
  metadata = jsonb_strip_nulls(
    COALESCE(eo.metadata, '{}'::jsonb) ||
    jsonb_build_object(
      'sector', 'Waste logistics & transport'
    )
  )
FROM organizations o
WHERE eo.organization_id = o.id
  AND o.name ILIKE 'Kosovo Waste Management Ltd%';

-- EcoCircle Kosova (circular trading)
UPDATE organizations
SET
  description = 'B2B platform connecting waste producers with processors for circular material flows.',
  location = 'Prishtina, Kosovo',
  primary_interest = 'Circular Economy Trading'
WHERE name ILIKE 'EcoCircle Kosova%';

UPDATE eco_organizations eo
SET
  waste_types_handled = ARRAY['Secondary materials', 'Industrial byproducts'],
  service_areas = ARRAY['Prishtina', 'Gjilan', 'Mitrovica', 'Peja'],
  metadata = jsonb_strip_nulls(
    COALESCE(eo.metadata, '{}'::jsonb) ||
    jsonb_build_object(
      'sector', 'Circular materials brokerage'
    )
  )
FROM organizations o
WHERE eo.organization_id = o.id
  AND o.name ILIKE 'EcoCircle Kosova%';

-- BioBuild Solutions (construction waste)
UPDATE organizations
SET
  description = 'Construction and demolition waste recovery supplying recycled aggregates.',
  location = 'Ferizaj, Kosovo',
  primary_interest = 'Construction Waste'
WHERE name ILIKE 'BioBuild Solutions%';

UPDATE eco_organizations eo
SET
  waste_types_handled = ARRAY['CDW', 'Aggregates', 'Concrete'],
  service_areas = ARRAY['Ferizaj', 'Shtime', 'Lipjan'],
  metadata = jsonb_strip_nulls(
    COALESCE(eo.metadata, '{}'::jsonb) ||
    jsonb_build_object(
      'sector', 'Construction & demolition recovery'
    )
  )
FROM organizations o
WHERE eo.organization_id = o.id
  AND o.name ILIKE 'BioBuild Solutions%';

-- ECO GREEN Initiative (NGO)
UPDATE organizations
SET
  description = 'Environmental education NGO promoting waste reduction, composting and circular practices.',
  location = 'Prishtina, Kosovo',
  primary_interest = 'Environmental Education'
WHERE name ILIKE 'ECO GREEN Initiative%';

UPDATE eco_organizations eo
SET
  waste_types_handled = ARRAY['Organic waste', 'Educational materials'],
  service_areas = ARRAY['Prishtina', 'Fushë Kosovë', 'Obiliq'],
  metadata = jsonb_strip_nulls(
    COALESCE(eo.metadata, '{}'::jsonb) ||
    jsonb_build_object(
      'sector', 'Environmental education & outreach'
    )
  )
FROM organizations o
WHERE eo.organization_id = o.id
  AND o.name ILIKE 'ECO GREEN Initiative%';

-- Clean Future Foundation (NGO)
UPDATE organizations
SET
  description = 'Advocacy NGO focusing on plastic reduction, community cleanups and sustainable consumption.',
  location = 'Gjakova, Kosovo',
  primary_interest = 'Environmental Advocacy'
WHERE name ILIKE 'Clean Future Foundation%';

UPDATE eco_organizations eo
SET
  waste_types_handled = ARRAY['Plastic packaging', 'Single-use materials'],
  service_areas = ARRAY['Gjakova', 'Rahovec', 'Prizren'],
  metadata = jsonb_strip_nulls(
    COALESCE(eo.metadata, '{}'::jsonb) ||
    jsonb_build_object(
      'sector', 'Plastic reduction & advocacy'
    )
  )
FROM organizations o
WHERE eo.organization_id = o.id
  AND o.name ILIKE 'Clean Future Foundation%';

-- Green Jobs Cooperative (social enterprise)
UPDATE organizations
SET
  description = 'Social enterprise creating green jobs through waste management training and formalization.',
  location = 'Prizren, Kosovo',
  primary_interest = 'Social Employment'
WHERE name ILIKE 'Green Jobs Cooperative%';

UPDATE eco_organizations eo
SET
  waste_types_handled = ARRAY['Mixed recyclables', 'Cardboard', 'Plastics'],
  service_areas = ARRAY['Prizren', 'Suharekë', 'Dragash'],
  metadata = jsonb_strip_nulls(
    COALESCE(eo.metadata, '{}'::jsonb) ||
    jsonb_build_object(
      'sector', 'Green jobs & social enterprise'
    )
  )
FROM organizations o
WHERE eo.organization_id = o.id
  AND o.name ILIKE 'Green Jobs Cooperative%';

-- Textile Revival Kosova (textile upcycling)
UPDATE organizations
SET
  description = 'Collects and upcycles used clothing into new textile goods with community workshops.',
  location = 'Prishtina, Kosovo',
  primary_interest = 'Textile Upcycling'
WHERE name ILIKE 'Textile Revival Kosova%';

UPDATE eco_organizations eo
SET
  waste_types_handled = ARRAY['Used clothing', 'Textile scraps'],
  service_areas = ARRAY['Prishtina', 'Fushë Kosovë', 'Vushtrri'],
  metadata = jsonb_strip_nulls(
    COALESCE(eo.metadata, '{}'::jsonb) ||
    jsonb_build_object(
      'sector', 'Textile recovery & upcycling'
    )
  )
FROM organizations o
WHERE eo.organization_id = o.id
  AND o.name ILIKE 'Textile Revival Kosova%';
