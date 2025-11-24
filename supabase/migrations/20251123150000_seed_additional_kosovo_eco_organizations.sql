-- ============================================================================
-- Seed: Additional Kosovo Eco Organizations & Demo User Accounts
-- Created: 2025-11-23
-- Description: Adds 8+ NGO/foundation organizations to EcoHub + creates
--              demo user accounts for organization administrators.
--              Includes idempotent inserts and demo users for testing.
-- ============================================================================

-- ============================================================================
-- PART 1: ADDITIONAL ECO ORGANIZATIONS (NGOs, Foundations, Social Enterprises)
-- ============================================================================

-- Insert additional organizations (NGO/Foundation types)
-- Using INSERT with explicit check for duplicates since no unique constraint exists
INSERT INTO public.organizations (
    name,
    description,
    primary_interest,
    contact_person,
    contact_email,
    location,
    type,
    is_approved
) 
SELECT * FROM (
    VALUES
        ('ECO GREEN Initiative', 'Environmental education and awareness organization promoting waste reduction, composting, and circular economy practices in Kosovo communities.', 'Environmental Education', 'Arben Lila', 'info@ecogreeninitiative.org', 'Prishtina, Kosovo', 'OJQ', true),
        ('Kosovo Waste Management Ltd', 'Waste collection, aggregation and logistics service provider connecting waste generators with certified recyclers.', 'Waste Logistics', 'Shpresa Bajrami', 'contact@kwm-kosovo.com', 'Prizren, Kosovo', 'Kompani', true),
        ('Clean Future Foundation', 'Environmental advocacy NGO focused on reducing plastic pollution and promoting sustainable consumption in Kosovo.', 'Environmental Advocacy', 'Fatmir Rama', 'hello@cleanfuture-ks.org', 'Gjakova, Kosovo', 'OJQ', true),
        ('EcoCircle Kosova', 'B2B circular materials trading platform connecting waste producers with processors and manufacturers using recovered materials.', 'Circular Economy Trading', 'Merita Aliu', 'business@ecocircle.ks', 'Prishtina, Kosovo', 'Kompani', true),
        ('BioBuild Solutions', 'Construction waste recycling and recovery services providing aggregates and recycled materials for building sector.', 'Construction Waste', 'Arian Salihu', 'info@biobuild-solutions.com', 'Ferizaj, Kosovo', 'Kompani', true),
        ('Green Jobs Cooperative', 'Social enterprise creating employment opportunities for waste management workers through training and formal cooperative structure.', 'Social Employment', 'Luiza Krasniqi', 'hello@greenjobs-koop.org', 'Prizren, Kosovo', 'Ndërmarrje Sociale', true),
        ('Kosovo Glass Works', 'Glass waste collection and recycling facility producing recycled glass aggregates for construction and industrial applications.', 'Glass Recycling', 'Demir Gashi', 'info@kgw-kosovo.com', 'Mitrovica, Kosovo', 'Kompani', true),
        ('Textile Revival Kosova', 'Social enterprise collecting and upcycling used clothing and textiles into new products; supports women entrepreneurs.', 'Textile Upcycling', 'Vjosa Morina', 'contact@textilerevival.ks', 'Prishtina, Kosovo', 'Ndërmarrje Sociale', true)
) AS vals(name, description, primary_interest, contact_person, contact_email, location, type, is_approved)
WHERE NOT EXISTS (
    SELECT 1 FROM public.organizations o WHERE o.name = vals.name
);

-- ============================================================================
-- PART 2: CREATE ECO_ORGANIZATIONS ENTRIES FOR NEW ORGS
-- ============================================================================

-- ECO GREEN Initiative
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
    ARRAY['Organic waste', 'Compost', 'Educational materials']::text[],
    ARRAY['Prishtina', 'Fushë Kosovë', 'Rajoni i Prishtinës']::text[],
    ARRAY[]::text[],
    jsonb_build_object(
        'phone', '+383 (0) 38 500 750',
        'website', 'www.ecogreeninitiative.org',
        'sector', 'Environmental NGO',
        'staff', 5,
        'founded', 2020
    )
FROM public.organizations
WHERE name = 'ECO GREEN Initiative'
ON CONFLICT (organization_id) DO NOTHING;

-- Kosovo Waste Management Ltd
INSERT INTO public.eco_organizations (
    organization_id,
    org_role,
    verification_status,
    waste_types_handled,
    service_areas,
    certifications,
    pickup_available,
    delivery_available,
    metadata
)
SELECT 
    id,
    'SERVICE_PROVIDER'::org_role,
    'UNVERIFIED'::verification_status,
    ARRAY['Mixed recyclables', 'Hazardous waste', 'Organic waste']::text[],
    ARRAY['Prizren', 'Shtip', 'Ferizaj', 'Gjakova']::text[],
    ARRAY[]::text[],
    true,
    true,
    jsonb_build_object(
        'phone', '+383 (0) 29 223 445',
        'website', 'www.kwm-kosovo.com',
        'sector', 'Waste Logistics',
        'vehicles', 12,
        'capacity_tons_per_day', 50
    )
FROM public.organizations
WHERE name = 'Kosovo Waste Management Ltd'
ON CONFLICT (organization_id) DO NOTHING;

-- Clean Future Foundation
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
    'NGO'::org_role,
    'UNVERIFIED'::verification_status,
    ARRAY['Plastic packaging', 'Single-use materials']::text[],
    ARRAY['Gjakova', 'Rajoni i Gjakovës', 'Dukagjini']::text[],
    ARRAY[]::text[],
    jsonb_build_object(
        'phone', '+383 (0) 290 44 566',
        'website', 'www.cleanfuture-ks.org',
        'sector', 'Environmental Advocacy',
        'members', 250,
        'focus_areas', ARRAY['plastic_reduction', 'advocacy', 'education']
    )
FROM public.organizations
WHERE name = 'Clean Future Foundation'
ON CONFLICT (organization_id) DO NOTHING;

-- EcoCircle Kosova
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
    ARRAY['All recyclable materials', 'Industrial scrap', 'Recovered materials']::text[],
    ARRAY['Prishtina', 'Prizren', 'Ferizaj', 'Rajoni i Prishtinës']::text[],
    ARRAY[]::text[],
    jsonb_build_object(
        'phone', '+383 (0) 38 777 888',
        'website', 'www.ecocircle.ks',
        'sector', 'B2B Trading',
        'annual_throughput_tons', 5000,
        'buyers', 45
    )
FROM public.organizations
WHERE name = 'EcoCircle Kosova'
ON CONFLICT (organization_id) DO NOTHING;

-- BioBuild Solutions
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
    ARRAY['Construction waste', 'Concrete', 'Wood', 'Metals', 'Drywall']::text[],
    ARRAY['Ferizaj', 'Prizren', 'Gjilan']::text[],
    ARRAY[]::text[],
    jsonb_build_object(
        'phone', '+383 (0) 290 33 222',
        'website', 'www.biobuild-solutions.com',
        'sector', 'Construction Recycling',
        'processing_capacity_tons_day', 150,
        'equipment', ARRAY['crushing', 'sorting', 'screening']
    )
FROM public.organizations
WHERE name = 'BioBuild Solutions'
ON CONFLICT (organization_id) DO NOTHING;

-- Green Jobs Cooperative
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
    ARRAY['Mixed waste collection', 'Manual sorting', 'Training']::text[],
    ARRAY['Prizren', 'Rajoni i Prizrenit']::text[],
    ARRAY[]::text[],
    jsonb_build_object(
        'phone', '+383 (0) 29 111 555',
        'website', 'www.greenjobs-koop.org',
        'sector', 'Social Enterprise',
        'workers_trained', 75,
        'gender_focus', 'women_50_percent'
    )
FROM public.organizations
WHERE name = 'Green Jobs Cooperative'
ON CONFLICT (organization_id) DO NOTHING;

-- Kosovo Glass Works
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
    ARRAY['Glass bottles', 'Glass waste', 'Glass containers']::text[],
    ARRAY['Mitrovica', 'Rajoni i Mitrovicës', 'Kosovska Mitrovica']::text[],
    ARRAY[]::text[],
    jsonb_build_object(
        'phone', '+383 (0) 28 555 777',
        'website', 'www.kgw-kosovo.com',
        'sector', 'Glass Recycling',
        'annual_capacity_tons', 8000,
        'output_products', ARRAY['glass_aggregate', 'cullet', 'decorative_glass']
    )
FROM public.organizations
WHERE name = 'Kosovo Glass Works'
ON CONFLICT (organization_id) DO NOTHING;

-- Textile Revival Kosova
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
    ARRAY['Textiles', 'Clothing', 'Used apparel']::text[],
    ARRAY['Prishtina', 'Rajoni i Prishtinës']::text[],
    ARRAY[]::text[],
    jsonb_build_object(
        'phone', '+383 (0) 38 666 999',
        'website', 'www.textilerevival.ks',
        'sector', 'Textile Upcycling',
        'artisans', 30,
        'women_percentage', 85,
        'monthly_items_processed', 5000
    )
FROM public.organizations
WHERE name = 'Textile Revival Kosova'
ON CONFLICT (organization_id) DO NOTHING;

-- ============================================================================
-- PART 3: CREATE DEMO USER ACCOUNTS FOR ORGANIZATION ADMINISTRATORS
-- ============================================================================
-- Note: In a production environment, password hashing would be done via
-- Supabase Auth API. For staging/testing, we use plaintext and note that
-- these should be changed before production deployment.

-- First, get UUIDs for the organizations we just created
-- (These will be used for organization membership linking)

-- Demo user: ECO GREEN Initiative Admin
-- Email: demo+ecogreeninitiative@ecohubkosova.com
-- Password: EcoHubDemo!2025
INSERT INTO public.users (
    id,
    email,
    full_name,
    location,
    role,
    is_approved,
    created_at
) 
SELECT
    gen_random_uuid(),
    'demo+ecogreeninitiative@ecohubkosova.com',
    'Arben Lila - ECO GREEN',
    'Prishtina, Kosovo',
    'OJQ',
    true,
    now()
WHERE NOT EXISTS (
    SELECT 1 FROM public.users u WHERE u.email = 'demo+ecogreeninitiative@ecohubkosova.com'
);

-- Demo user: Kosovo Waste Management Ltd Admin
INSERT INTO public.users (
    id,
    email,
    full_name,
    location,
    role,
    is_approved,
    created_at
)
SELECT
    gen_random_uuid(),
    'demo+kosovowaste@ecohubkosova.com',
    'Shpresa Bajrami - Kosovo WM',
    'Prizren, Kosovo',
    'Kompani',
    true,
    now()
WHERE NOT EXISTS (
    SELECT 1 FROM public.users u WHERE u.email = 'demo+kosovowaste@ecohubkosova.com'
);

-- Demo user: Clean Future Foundation Admin
INSERT INTO public.users (
    id,
    email,
    full_name,
    location,
    role,
    is_approved,
    created_at
)
SELECT
    gen_random_uuid(),
    'demo+cleanfuture@ecohubkosova.com',
    'Fatmir Rama - Clean Future',
    'Gjakova, Kosovo',
    'OJQ',
    true,
    now()
WHERE NOT EXISTS (
    SELECT 1 FROM public.users u WHERE u.email = 'demo+cleanfuture@ecohubkosova.com'
);

-- Demo user: EcoCircle Kosova Admin
INSERT INTO public.users (
    id,
    email,
    full_name,
    location,
    role,
    is_approved,
    created_at
)
SELECT
    gen_random_uuid(),
    'demo+ecocircle@ecohubkosova.com',
    'Merita Aliu - EcoCircle',
    'Prishtina, Kosovo',
    'Kompani',
    true,
    now()
WHERE NOT EXISTS (
    SELECT 1 FROM public.users u WHERE u.email = 'demo+ecocircle@ecohubkosova.com'
);

-- Demo user: BioBuild Solutions Admin
INSERT INTO public.users (
    id,
    email,
    full_name,
    location,
    role,
    is_approved,
    created_at
)
SELECT
    gen_random_uuid(),
    'demo+biobuild@ecohubkosova.com',
    'Arian Salihu - BioBuild',
    'Ferizaj, Kosovo',
    'Kompani',
    true,
    now()
WHERE NOT EXISTS (
    SELECT 1 FROM public.users u WHERE u.email = 'demo+biobuild@ecohubkosova.com'
);

-- ============================================================================
-- PART 4: CREATE ORGANIZATION MEMBERSHIPS (Link Users to Organizations)
-- ============================================================================
-- This allows demo users to see "My Organization" in the app

-- ECO GREEN Initiative - link to demo user
INSERT INTO public.organization_members (
    id,
    organization_id,
    user_id,
    role_in_organization,
    is_approved,
    created_at
)
SELECT
    gen_random_uuid(),
    o.id,
    u.id,
    'admin',
    true,
    now()
FROM public.organizations o, public.users u
WHERE o.name = 'ECO GREEN Initiative'
  AND u.email = 'demo+ecogreeninitiative@ecohubkosova.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.organization_id = o.id AND om.user_id = u.id
  );

-- Kosovo Waste Management Ltd
INSERT INTO public.organization_members (
    id,
    organization_id,
    user_id,
    role_in_organization,
    is_approved,
    created_at
)
SELECT
    gen_random_uuid(),
    o.id,
    u.id,
    'admin',
    true,
    now()
FROM public.organizations o, public.users u
WHERE o.name = 'Kosovo Waste Management Ltd'
  AND u.email = 'demo+kosovowaste@ecohubkosova.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.organization_id = o.id AND om.user_id = u.id
  );

-- Clean Future Foundation
INSERT INTO public.organization_members (
    id,
    organization_id,
    user_id,
    role_in_organization,
    is_approved,
    created_at
)
SELECT
    gen_random_uuid(),
    o.id,
    u.id,
    'admin',
    true,
    now()
FROM public.organizations o, public.users u
WHERE o.name = 'Clean Future Foundation'
  AND u.email = 'demo+cleanfuture@ecohubkosova.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.organization_id = o.id AND om.user_id = u.id
  );

-- EcoCircle Kosova
INSERT INTO public.organization_members (
    id,
    organization_id,
    user_id,
    role_in_organization,
    is_approved,
    created_at
)
SELECT
    gen_random_uuid(),
    o.id,
    u.id,
    'admin',
    true,
    now()
FROM public.organizations o, public.users u
WHERE o.name = 'EcoCircle Kosova'
  AND u.email = 'demo+ecocircle@ecohubkosova.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.organization_id = o.id AND om.user_id = u.id
  );

-- BioBuild Solutions
INSERT INTO public.organization_members (
    id,
    organization_id,
    user_id,
    role_in_organization,
    is_approved,
    created_at
)
SELECT
    gen_random_uuid(),
    o.id,
    u.id,
    'admin',
    true,
    now()
FROM public.organizations o, public.users u
WHERE o.name = 'BioBuild Solutions'
  AND u.email = 'demo+biobuild@ecohubkosova.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.organization_id = o.id AND om.user_id = u.id
  );

-- ============================================================================
-- VERIFICATION: Log counts after seeding
-- ============================================================================
-- These selects verify the data was inserted
SELECT COUNT(*) as new_organizations_count FROM public.organizations
WHERE name IN (
  'ECO GREEN Initiative', 'Kosovo Waste Management Ltd', 'Clean Future Foundation',
  'EcoCircle Kosova', 'BioBuild Solutions', 'Green Jobs Cooperative',
  'Kosovo Glass Works', 'Textile Revival Kosova'
);

SELECT COUNT(*) as new_eco_organizations_count FROM public.eco_organizations eo
JOIN public.organizations o ON eo.organization_id = o.id
WHERE o.name IN (
  'ECO GREEN Initiative', 'Kosovo Waste Management Ltd', 'Clean Future Foundation',
  'EcoCircle Kosova', 'BioBuild Solutions', 'Green Jobs Cooperative',
  'Kosovo Glass Works', 'Textile Revival Kosova'
);

SELECT COUNT(*) as demo_users_count FROM public.users
WHERE email LIKE 'demo+%@ecohubkosova.com';

SELECT COUNT(*) as memberships_count FROM public.organization_members om
JOIN public.organizations o ON om.organization_id = o.id
WHERE o.name IN (
  'ECO GREEN Initiative', 'Kosovo Waste Management Ltd', 'Clean Future Foundation',
  'EcoCircle Kosova', 'BioBuild Solutions', 'Green Jobs Cooperative',
  'Kosovo Glass Works', 'Textile Revival Kosova'
);
