-- Quick script to create a test V2 listing in eco_listings
-- Run this in Supabase SQL Editor to have at least one ACTIVE + PUBLIC listing

-- First, ensure you have a category (or use an existing one)
-- Get the first category ID
DO $$
DECLARE
  v_category_id uuid;
  v_user_id uuid;
  v_listing_id uuid;
BEGIN
  -- Get first active category
  SELECT id INTO v_category_id FROM eco_categories WHERE is_active = true LIMIT 1;
  
  -- Get first user (or replace with your user ID)
  SELECT id INTO v_user_id FROM users LIMIT 1;
  
  -- Create a test listing
  INSERT INTO eco_listings (
    id,
    created_by_user_id,
    category_id,
    title,
    description,
    flow_type,
    condition,
    quantity,
    unit,
    price,
    currency,
    pricing_type,
    city,
    eco_labels,
    tags,
    status,
    visibility,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    v_user_id,
    v_category_id,
    'Plastikë e riciklueshme - Test Listing',
    'Kjo është një ofertë test për plastikë të riciklueshme. Sapo të keni të dhëna reale në eco_listings, mund ta fshini këtë.',
    'OFFER_MATERIAL',
    'GOOD',
    100,
    'kg',
    50.00,
    'EUR',
    'FIXED',
    'Prishtinë',
    ARRAY['RECYCLABLE', 'ECO_FRIENDLY'],
    ARRAY['plastikë', 'riciklim', 'test'],
    'ACTIVE',
    'PUBLIC',
    NOW(),
    NOW()
  )
  RETURNING id INTO v_listing_id;
  
  RAISE NOTICE 'Created test listing with ID: %', v_listing_id;
END $$;

-- Verify the listing was created
SELECT 
  id,
  title,
  flow_type,
  status,
  visibility,
  city
FROM eco_listings
WHERE status = 'ACTIVE' AND visibility = 'PUBLIC'
ORDER BY created_at DESC
LIMIT 5;
