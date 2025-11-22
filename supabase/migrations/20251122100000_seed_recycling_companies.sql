-- ============================================================================
-- Seed: Kosovo Recycling Companies
-- Created: 2025-11-22
-- Description: Inserts 12 Kosovo recycling and waste management companies
--              into organizations and eco_organizations tables.
--              Uses ON CONFLICT to safely handle re-runs.
-- ============================================================================

-- Insert base organizations
-- Using ON CONFLICT on the unique name constraint to handle re-runs
INSERT INTO public.organizations (
    name,
    description,
    primary_interest,
    contact_person,
    contact_email,
    location,
    type,
    is_approved
) VALUES
    ('REC-KOS Sh.p.k.', 'Metal recycling company specializing in ferrous and non-ferrous metal recovery and processing.', 'Metal Recycling', 'REC-KOS Team', 'info@rec-kos.com', 'Prishtina, Kosovo', 'RECYCLER', true),
    ('PLASTIKA Sh.p.k.', 'Plastic waste collection and recycling facility processing PET, HDPE, and LDPE materials.', 'Plastic Recycling', 'PLASTIKA Team', 'contact@plastika.com', 'Prishtina, Kosovo', 'RECYCLER', true),
    ('EUROGOMA Sh.p.k.', 'Tire recycling specialist processing end-of-life tires and rubber materials.', 'Tire Recycling', 'EUROGOMA Team', 'info@eurogoma.com', 'Ferizaj, Kosovo', 'RECYCLER', true),
    ('ECO KOS Sh.p.k.', 'WEEE recycler handling electronic waste, recovering valuable metals, plastics and materials.', 'WEEE Recycling', 'ECO KOS Team', 'info@ecokos.com', 'Prishtina, Kosovo', 'RECYCLER', true),
    ('POWERPACK Sh.p.k.', 'Battery recycling facility specializing in lead-acid and lithium battery processing.', 'Battery Recycling', 'POWERPACK Team', 'contact@powerpack.com', 'Prizren, Kosovo', 'RECYCLER', true),
    ('TE BLERIM LUZHA Sh.p.k.', 'Waste collection and management service providing primary collection for recyclables and general waste.', 'Waste Collection', 'TE BLERIM LUZHA Team', 'contact@tblussha.com', 'Peja, Kosovo', 'SERVICE_PROVIDER', true),
    ('EUROPEAN METAL RECYCLING (Local Obiliq)', 'International metal recycling company with operations in Obiliq, processing scrap metals and steel.', 'Metal Recycling', 'EMR Team', 'obiliq@emr-kosovo.com', 'Obiliq, Kosovo', 'RECYCLER', true),
    ('SIMPLY GREEN Sh.p.k.', 'Environmental services provider specializing in organic waste management and composting.', 'Organic Waste Management', 'SIMPLY GREEN Team', 'info@simplygreen.com', 'Mitrovica, Kosovo', 'SERVICE_PROVIDER', true),
    ('KOSOVO GLASS RECYCLING', 'Glass recycling specialist processing glass waste and beverage containers.', 'Glass Recycling', 'KGR Team', 'info@kosovosglass.com', 'Prishtina, Kosovo', 'RECYCLER', true),
    ('RICIKLIMI-ED Sh.p.k.', 'Recycling collection company gathering mixed recyclables and preparing materials for processing.', 'Mixed Recycling', 'RICIKLIMI-ED Team', 'contact@riciklimi-ed.com', 'Gjakova, Kosovo', 'COLLECTOR', true),
    ('BIO 365 Sh.p.k.', 'Bioconversion and composting service handling agricultural and organic waste streams.', 'Organic Waste & Compost', 'BIO 365 Team', 'info@bio365.com', 'Prizren, Kosovo', 'SERVICE_PROVIDER', true),
    ('UPCYCLE KOSOVO', 'Social upcycling enterprise transforming textile and clothing waste into quality products.', 'Textile Upcycling', 'UPCYCLE Team', 'hello@upcyclekosovo.com', 'Prishtina, Kosovo', 'SERVICE_PROVIDER', true)
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    updated_at = now();

-- Insert eco_organizations with appropriate metadata
-- REC-KOS Sh.p.k.
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
    id,
    'RECYCLER'::org_role,
    'UNVERIFIED'::verification_status,
    ARRAY['Ferrous metals', 'Non-ferrous metals', 'Aluminum']::text[],
    ARRAY['Prishtina', 'Prizren']::text[],
    ARRAY[]::text[],
    jsonb_build_object('phone', '+383 (0) 38 500 700', 'sector', 'Metal Recycling', 'notes', 'Leading metal recycler in Kosovo')
FROM public.organizations
WHERE name = 'REC-KOS Sh.p.k.'
ON CONFLICT (organization_id) DO NOTHING;

-- PLASTIKA Sh.p.k.
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
    id,
    'RECYCLER'::org_role,
    'UNVERIFIED'::verification_status,
    ARRAY['Plastic waste', 'PET', 'HDPE', 'LDPE']::text[],
    ARRAY['Prishtina']::text[],
    ARRAY[]::text[],
    jsonb_build_object('phone', '+383 (0) 38 500 701', 'sector', 'Plastic Recycling', 'notes', 'Major plastic recycler')
FROM public.organizations
WHERE name = 'PLASTIKA Sh.p.k.'
ON CONFLICT (organization_id) DO NOTHING;

-- EUROGOMA Sh.p.k.
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
    id,
    'RECYCLER'::org_role,
    'UNVERIFIED'::verification_status,
    ARRAY['End-of-life tires', 'Rubber products']::text[],
    ARRAY['Ferizaj']::text[],
    ARRAY[]::text[],
    jsonb_build_object('phone', '+383 (0) 290 44 345', 'sector', 'Tire Recycling', 'notes', 'Tire recycling company')
FROM public.organizations
WHERE name = 'EUROGOMA Sh.p.k.'
ON CONFLICT (organization_id) DO NOTHING;

-- ECO KOS Sh.p.k.
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
    id,
    'RECYCLER'::org_role,
    'VERIFIED'::verification_status,
    ARRAY['WEEE', 'Electronics', 'Metals', 'Plastics']::text[],
    ARRAY['Prishtina']::text[],
    ARRAY['ISCC EU']::text[],
    jsonb_build_object('phone', '+383 (0) 38 500 702', 'sector', 'WEEE Recycling', 'notes', 'WEEE and electronics recycler with ISCC EU certification')
FROM public.organizations
WHERE name = 'ECO KOS Sh.p.k.'
ON CONFLICT (organization_id) DO NOTHING;

-- POWERPACK Sh.p.k.
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
    id,
    'RECYCLER'::org_role,
    'VERIFIED'::verification_status,
    ARRAY['Used batteries', 'Lead-acid batteries', 'Lithium batteries']::text[],
    ARRAY['Prizren']::text[],
    ARRAY['QA-CER']::text[],
    jsonb_build_object('phone', '+383 (0) 290 42 100', 'sector', 'Battery Recycling', 'notes', 'Battery recycler with QA-CER certification')
FROM public.organizations
WHERE name = 'POWERPACK Sh.p.k.'
ON CONFLICT (organization_id) DO NOTHING;

-- TE BLERIM LUZHA Sh.p.k.
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
    id,
    'COLLECTOR'::org_role,
    'UNVERIFIED'::verification_status,
    ARRAY['General waste', 'Recyclables', 'Paper', 'Cardboard']::text[],
    ARRAY['Peja']::text[],
    ARRAY[]::text[],
    jsonb_build_object('phone', '+383 (0) 290 58 800', 'sector', 'Waste Collection', 'notes', 'Waste collection and management')
FROM public.organizations
WHERE name = 'TE BLERIM LUZHA Sh.p.k.'
ON CONFLICT (organization_id) DO NOTHING;

-- EUROPEAN METAL RECYCLING (Local Obiliq)
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
    id,
    'RECYCLER'::org_role,
    'UNVERIFIED'::verification_status,
    ARRAY['Scrap metal', 'Steel', 'Stainless steel', 'Mixed metals']::text[],
    ARRAY['Obiliq', 'Prizren']::text[],
    ARRAY[]::text[],
    jsonb_build_object('phone', '+383 (0) 38 500 750', 'sector', 'Metal Recycling', 'notes', 'European Metal Recycling subsidiary')
FROM public.organizations
WHERE name = 'EUROPEAN METAL RECYCLING (Local Obiliq)'
ON CONFLICT (organization_id) DO NOTHING;

-- SIMPLY GREEN Sh.p.k.
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
    id,
    'SERVICE_PROVIDER'::org_role,
    'UNVERIFIED'::verification_status,
    ARRAY['Organic waste', 'Biomass', 'Compost']::text[],
    ARRAY['Mitrovica']::text[],
    ARRAY[]::text[],
    jsonb_build_object('phone', '+383 (0) 290 55 300', 'sector', 'Organic Waste Management', 'notes', 'Organic waste and composting service')
FROM public.organizations
WHERE name = 'SIMPLY GREEN Sh.p.k.'
ON CONFLICT (organization_id) DO NOTHING;

-- KOSOVO GLASS RECYCLING
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
    id,
    'RECYCLER'::org_role,
    'UNVERIFIED'::verification_status,
    ARRAY['Glass waste', 'Glass bottles', 'Glass containers']::text[],
    ARRAY['Prishtina']::text[],
    ARRAY[]::text[],
    jsonb_build_object('phone', '+383 (0) 38 500 703', 'sector', 'Glass Recycling', 'notes', 'Glass recycling facility')
FROM public.organizations
WHERE name = 'KOSOVO GLASS RECYCLING'
ON CONFLICT (organization_id) DO NOTHING;

-- RICIKLIMI-ED Sh.p.k.
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
    id,
    'COLLECTOR'::org_role,
    'UNVERIFIED'::verification_status,
    ARRAY['Mixed recyclables', 'Waste paper', 'Cardboard', 'Metals']::text[],
    ARRAY['Gjakova']::text[],
    ARRAY[]::text[],
    jsonb_build_object('phone', '+383 (0) 290 35 200', 'sector', 'Mixed Recycling', 'notes', 'General recycling collector')
FROM public.organizations
WHERE name = 'RICIKLIMI-ED Sh.p.k.'
ON CONFLICT (organization_id) DO NOTHING;

-- BIO 365 Sh.p.k.
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
    id,
    'SERVICE_PROVIDER'::org_role,
    'UNVERIFIED'::verification_status,
    ARRAY['Organic waste', 'Agricultural waste', 'Biomass', 'Compost']::text[],
    ARRAY['Prizren']::text[],
    ARRAY[]::text[],
    jsonb_build_object('phone', '+383 (0) 290 42 500', 'sector', 'Organic Waste & Compost', 'notes', 'Organic waste bioconversion')
FROM public.organizations
WHERE name = 'BIO 365 Sh.p.k.'
ON CONFLICT (organization_id) DO NOTHING;

-- UPCYCLE KOSOVO
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
    id,
    'SERVICE_PROVIDER'::org_role,
    'UNVERIFIED'::verification_status,
    ARRAY['Waste textiles', 'Clothing', 'Fabric scraps', 'Upcycled products']::text[],
    ARRAY['Prishtina']::text[],
    ARRAY[]::text[],
    jsonb_build_object('phone', '+383 (0) 38 500 704', 'sector', 'Textile Upcycling', 'notes', 'Social enterprise focused on textile upcycling')
FROM public.organizations
WHERE name = 'UPCYCLE KOSOVO'
ON CONFLICT (organization_id) DO NOTHING;
