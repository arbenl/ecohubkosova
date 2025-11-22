-- Phase 4.8: Seed Kosovo Recycling Companies as Eco Organizations
-- Date: 2025-11-22
-- Description: Inserts 12 Kosovo recycling and waste management organizations
-- Safety: Uses ON CONFLICT for idempotent re-runs

-- Enable upsert for organizations
ALTER TABLE organizations DROP CONSTRAINT IF EXISTS organizations_pkey CASCADE;
ALTER TABLE organizations ADD PRIMARY KEY (id);

-- Create organizations from seed data
INSERT INTO public.organizations (
    id,
    name,
    description,
    primary_interest,
    contact_person,
    contact_email,
    location,
    type,
    is_approved,
    created_at,
    updated_at
) VALUES
-- 1. REC-KOS - Metal Recycler
(
    gen_random_uuid(),
    'REC-KOS Sh.p.k.',
    'Metal recycling facility processing ferrous and non-ferrous metals.',
    'Metal Recycling',
    'REC-KOS Team',
    'info@rec-kos.com',
    'Prishtina, Kosovo',
    'OJQ',
    true,
    now(),
    now()
),
-- 2. PLASTIKA - Plastic Recycler
(
    gen_random_uuid(),
    'PLASTIKA Sh.p.k.',
    'Plastic waste collection and recycling facility.',
    'Plastic Recycling',
    'PLASTIKA Team',
    'contact@plastika.com',
    'Prishtina, Kosovo',
    'OJQ',
    true,
    now(),
    now()
),
-- 3. EUROGOMA - Tire Recycler
(
    gen_random_uuid(),
    'EUROGOMA Sh.p.k.',
    'Tire and rubber recycling specialist.',
    'Tire & Rubber Recycling',
    'EUROGOMA Team',
    'info@eurogoma.com',
    'Ferizaj, Kosovo',
    'OJQ',
    true,
    now(),
    now()
),
-- 4. ECO KOS - WEEE Recycler (VERIFIED - ISCC EU)
(
    gen_random_uuid(),
    'ECO KOS Sh.p.k.',
    'Electronic waste and WEEE recycling certified by ISCC EU.',
    'WEEE & Electronics Recycling',
    'ECO KOS Team',
    'info@eco-kos.com',
    'Prishtina, Kosovo',
    'OJQ',
    true,
    now(),
    now()
),
-- 5. POWERPACK - Battery Recycler (VERIFIED - QA-CER)
(
    gen_random_uuid(),
    'POWERPACK Sh.p.k.',
    'Battery recycling facility certified by QA-CER.',
    'Battery Recycling',
    'POWERPACK Team',
    'info@powerpack.com',
    'Prizren, Kosovo',
    'OJQ',
    true,
    now(),
    now()
),
-- 6. TE BLERIM LUZHA - Waste Collector
(
    gen_random_uuid(),
    'TE BLERIM LUZHA Sh.p.k.',
    'Waste collection and aggregation service.',
    'Waste Collection',
    'TE BLERIM LUZHA Team',
    'info@teblerim.com',
    'Peja, Kosovo',
    'OJQ',
    true,
    now(),
    now()
),
-- 7. EUROPEAN METAL RECYCLING - Metal Recycler
(
    gen_random_uuid(),
    'EUROPEAN METAL RECYCLING',
    'Industrial scrap metal and steel recycling.',
    'Industrial Metal Recycling',
    'EUROPEAN METAL RECYCLING Team',
    'info@emr-kos.com',
    'Obiliq, Kosovo',
    'OJQ',
    true,
    now(),
    now()
),
-- 8. SIMPLY GREEN - Organic Waste Service
(
    gen_random_uuid(),
    'SIMPLY GREEN Sh.p.k.',
    'Organic waste processing and composting service.',
    'Organic Waste Management',
    'SIMPLY GREEN Team',
    'info@simplygreen.com',
    'Mitrovica, Kosovo',
    'OJQ',
    true,
    now(),
    now()
),
-- 9. KOSOVO GLASS RECYCLING - Glass Recycler
(
    gen_random_uuid(),
    'KOSOVO GLASS RECYCLING',
    'Glass waste collection and processing facility.',
    'Glass Recycling',
    'KOSOVO GLASS RECYCLING Team',
    'info@glassrecycling.com',
    'Prishtina, Kosovo',
    'OJQ',
    true,
    now(),
    now()
),
-- 10. RICIKLIMI-ED - Mixed Waste Collector
(
    gen_random_uuid(),
    'RICIKLIMI-ED Sh.p.k.',
    'Mixed waste collection and sorting service.',
    'Mixed Waste Collection',
    'RICIKLIMI-ED Team',
    'info@riciklimi.com',
    'Gjakova, Kosovo',
    'OJQ',
    true,
    now(),
    now()
),
-- 11. BIO 365 - Organic Waste Service
(
    gen_random_uuid(),
    'BIO 365 Sh.p.k.',
    'Agricultural and organic waste management.',
    'Organic Waste Management',
    'BIO 365 Team',
    'info@bio365.com',
    'Prizren, Kosovo',
    'OJQ',
    true,
    now(),
    now()
),
-- 12. UPCYCLE KOSOVO - Textile Upcycling Service
(
    gen_random_uuid(),
    'UPCYCLE KOSOVO',
    'Textile upcycling and product development service.',
    'Textile Upcycling',
    'UPCYCLE KOSOVO Team',
    'info@upcyclekosovo.com',
    'Prishtina, Kosovo',
    'OJQ',
    true,
    now(),
    now()
)
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    updated_at = now();

-- Now create corresponding eco_organizations profiles
-- These will be linked via organization_id based on name matching
INSERT INTO public.eco_organizations (
    organization_id,
    org_role,
    verification_status,
    waste_types_handled,
    service_areas,
    certifications,
    metadata
)
SELECT 
    o.id,
    CASE o.primary_interest
        WHEN 'Metal Recycling' THEN 'RECYCLER'::org_role
        WHEN 'Plastic Recycling' THEN 'RECYCLER'::org_role
        WHEN 'Tire & Rubber Recycling' THEN 'RECYCLER'::org_role
        WHEN 'WEEE & Electronics Recycling' THEN 'RECYCLER'::org_role
        WHEN 'Battery Recycling' THEN 'RECYCLER'::org_role
        WHEN 'Waste Collection' THEN 'COLLECTOR'::org_role
        WHEN 'Industrial Metal Recycling' THEN 'RECYCLER'::org_role
        WHEN 'Organic Waste Management' THEN 'SERVICE_PROVIDER'::org_role
        WHEN 'Glass Recycling' THEN 'RECYCLER'::org_role
        WHEN 'Mixed Waste Collection' THEN 'COLLECTOR'::org_role
        ELSE 'SERVICE_PROVIDER'::org_role
    END,
    CASE o.name
        WHEN 'ECO KOS Sh.p.k.' THEN 'VERIFIED'::verification_status
        WHEN 'POWERPACK Sh.p.k.' THEN 'VERIFIED'::verification_status
        ELSE 'UNVERIFIED'::verification_status
    END,
    CASE o.name
        WHEN 'REC-KOS Sh.p.k.' THEN ARRAY['Ferrous metals', 'Non-ferrous metals', 'Aluminum']::text[]
        WHEN 'PLASTIKA Sh.p.k.' THEN ARRAY['Plastic waste', 'PET', 'HDPE', 'LDPE']::text[]
        WHEN 'EUROGOMA Sh.p.k.' THEN ARRAY['End-of-life tires', 'Rubber']::text[]
        WHEN 'ECO KOS Sh.p.k.' THEN ARRAY['WEEE', 'Electronics', 'Metals']::text[]
        WHEN 'POWERPACK Sh.p.k.' THEN ARRAY['Batteries', 'Lead-acid', 'Lithium']::text[]
        WHEN 'TE BLERIM LUZHA Sh.p.k.' THEN ARRAY['General waste', 'Recyclables', 'Paper']::text[]
        WHEN 'EUROPEAN METAL RECYCLING' THEN ARRAY['Scrap metal', 'Steel']::text[]
        WHEN 'SIMPLY GREEN Sh.p.k.' THEN ARRAY['Organic waste', 'Biomass', 'Compost']::text[]
        WHEN 'KOSOVO GLASS RECYCLING' THEN ARRAY['Glass waste', 'Bottles', 'Containers']::text[]
        WHEN 'RICIKLIMI-ED Sh.p.k.' THEN ARRAY['Mixed recyclables', 'Paper', 'Metals']::text[]
        WHEN 'BIO 365 Sh.p.k.' THEN ARRAY['Organic waste', 'Agricultural waste']::text[]
        WHEN 'UPCYCLE KOSOVO' THEN ARRAY['Textiles', 'Clothing', 'Upcycled products']::text[]
        ELSE ARRAY[]::text[]
    END,
    CASE o.name
        WHEN 'REC-KOS Sh.p.k.' THEN ARRAY['Prishtina']::text[]
        WHEN 'PLASTIKA Sh.p.k.' THEN ARRAY['Prishtina']::text[]
        WHEN 'EUROGOMA Sh.p.k.' THEN ARRAY['Ferizaj']::text[]
        WHEN 'ECO KOS Sh.p.k.' THEN ARRAY['Prishtina']::text[]
        WHEN 'POWERPACK Sh.p.k.' THEN ARRAY['Prizren']::text[]
        WHEN 'TE BLERIM LUZHA Sh.p.k.' THEN ARRAY['Peja']::text[]
        WHEN 'EUROPEAN METAL RECYCLING' THEN ARRAY['Obiliq']::text[]
        WHEN 'SIMPLY GREEN Sh.p.k.' THEN ARRAY['Mitrovica']::text[]
        WHEN 'KOSOVO GLASS RECYCLING' THEN ARRAY['Prishtina']::text[]
        WHEN 'RICIKLIMI-ED Sh.p.k.' THEN ARRAY['Gjakova']::text[]
        WHEN 'BIO 365 Sh.p.k.' THEN ARRAY['Prizren']::text[]
        WHEN 'UPCYCLE KOSOVO' THEN ARRAY['Prishtina']::text[]
        ELSE ARRAY[]::text[]
    END,
    CASE o.name
        WHEN 'ECO KOS Sh.p.k.' THEN ARRAY['ISCC EU']::text[]
        WHEN 'POWERPACK Sh.p.k.' THEN ARRAY['QA-CER']::text[]
        ELSE ARRAY[]::text[]
    END,
    jsonb_build_object(
        'phone', o.contact_email,
        'sector', o.primary_interest,
        'source', 'Phase 4.8 Kosovo Recycling Companies Import'
    )
FROM public.organizations o
WHERE o.type = 'OJQ' 
  AND (o.name LIKE '%REC-KOS%' 
    OR o.name LIKE '%PLASTIKA%'
    OR o.name LIKE '%EUROGOMA%'
    OR o.name LIKE '%ECO KOS%'
    OR o.name LIKE '%POWERPACK%'
    OR o.name LIKE '%TE BLERIM%'
    OR o.name LIKE '%EUROPEAN METAL%'
    OR o.name LIKE '%SIMPLY GREEN%'
    OR o.name LIKE '%KOSOVO GLASS%'
    OR o.name LIKE '%RICIKLIMI%'
    OR o.name LIKE '%BIO 365%'
    OR o.name LIKE '%UPCYCLE%')
ON CONFLICT (organization_id) DO NOTHING;
