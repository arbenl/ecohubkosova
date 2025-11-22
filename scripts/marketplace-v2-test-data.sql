-- ============================================================================
-- MARKETPLACE V2 - TEST LISTINGS
-- ============================================================================
-- Këto janë 3 listings testuese për Marketplace V2
-- Para se të ekzekutosh, zëvendëso:
--   - <YOUR_USER_ID> me user ID-në tënde (shiko më poshtë si ta gjesh)
--   - <CATEGORY_ID_MATERIALS> me një category ID për Materials
--   - <CATEGORY_ID_PRODUCTS> me një category ID për Products  
--   - <CATEGORY_ID_SERVICES> me një category ID për Services
-- ============================================================================

-- SI TË GJESH USER ID DHE CATEGORY IDS:
-- 1. Hap Supabase → SQL Editor
-- 2. Ekzekuto këto queries:
--
--    -- Për user ID:
--    SELECT id, email FROM users LIMIT 5;
--
--    -- Për category IDs:
--    SELECT id, slug, name_sq FROM eco_categories WHERE slug IN ('materials-metals', 'products-furniture', 'services-collection');
--
-- 3. Kopjo ID-të dhe zëvendësoi më poshtë

-- ============================================================================
-- LISTING 1: Material i riciklueshëm - Alumin nga shishet
-- ============================================================================
INSERT INTO eco_listings (
  id,
  created_by_user_id,
  organization_id,
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
  country,
  city,
  region,
  eco_labels,
  tags,
  status,
  verification_status,
  visibility
) VALUES (
  gen_random_uuid(),
  '<YOUR_USER_ID>',  -- ZËVENDËSO ME USER ID REALE
  NULL,
  '<CATEGORY_ID_MATERIALS>',  -- ZËVENDËSO ME CATEGORY ID (p.sh. materials-metals)
  'Alumin i ricikluar nga shishet - 500kg',
  'Material cilësor alumini i grumbulluar nga shishe të pijeve. I gatshëm për riciklim industrial. Sasitë variojnë çdo javë.',
  'OFFER_MATERIAL',
  'SCRAP',
  500,
  'kg',
  150.00,
  'EUR',
  'NEGOTIABLE',
  'XK',
  'Prishtinë',
  'Prishtinë',
  ARRAY['RECYCLED_CONTENT', 'LOCAL'],
  ARRAY['alumin', 'metal', 'riciklim', 'shishe'],
  'ACTIVE',
  'VERIFIED',
  'PUBLIC'
);

-- ============================================================================
-- LISTING 2: Produkt i ricikluar - Mobilje nga palet druri
-- ============================================================================
INSERT INTO eco_listings (
  id,
  created_by_user_id,
  organization_id,
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
  country,
  city,
  region,
  eco_labels,
  tags,
  status,
  verification_status,
  visibility
) VALUES (
  gen_random_uuid(),
  '<YOUR_USER_ID>',  -- ZËVENDËSO ME USER ID REALE
  NULL,
  '<CATEGORY_ID_PRODUCTS>',  -- ZËVENDËSO ME CATEGORY ID (p.sh. products-furniture)
  'Tavolina nga palet druri - Upcycled',
  'Tavolina e punuar me dorë nga palet druri të ricikluara. Dizajn modern dhe i qëndrueshëm. Për shtëpi, bare ose zyra. Dimensione: 120cm x 60cm x 45cm.',
  'OFFER_RECYCLED_PRODUCT',
  'USED_EXCELLENT',
  5,
  'pieces',
  95.00,
  'EUR',
  'FIXED',
  'XK',
  'Prizren',
  'Prizren',
  ARRAY['UPCYCLED', 'LOCAL', 'REPAIRABLE'],
  ARRAY['mobilje', 'dru', 'tavolina', 'palet', 'upcycled'],
  'ACTIVE',
  'VERIFIED',
  'PUBLIC'
);

-- ============================================================================
-- LISTING 3: Shërbim - Grumbullim i plastikës
-- ============================================================================
INSERT INTO eco_listings (
  id,
  created_by_user_id,
  organization_id,
  category_id,
  title,
  description,
  flow_type,
  pricing_type,
  country,
  city,
  region,
  eco_labels,
  tags,
  status,
  verification_status,
  visibility
) VALUES (
  gen_random_uuid(),
  '<YOUR_USER_ID>',  -- ZËVENDËSO ME USER ID REALE
  NULL,
  '<CATEGORY_ID_SERVICES>',  -- ZËVENDËSO ME CATEGORY ID (p.sh. services-collection)
  'Shërbim grumbullimi të plastikës për biznese',
  'Ofrojmë shërbim profesional të grumbullimit të mbeturinave plastike për kompani, restorante dhe qendra tregtare. Grumbullim i rregullt, çdo javë. Çmim i varur nga sasia.',
  'SERVICE_COLLECTION',
  'ON_REQUEST',
  'XK',
  'Pejë',
  'Pejë',
  ARRAY['ZERO_WASTE', 'LOCAL'],
  ARRAY['plastikë', 'grumbullim', 'riciklim', 'shërbim', 'zero-waste'],
  'ACTIVE',
  'VERIFIED',
  'PUBLIC'
);

-- ============================================================================
-- PAS EKZEKUTIMIT
-- ============================================================================
-- Pas ekzekutimit të suksesshëm, shko në:
-- http://localhost:3000/sq/marketplace-v2
-- 
-- Duhet të shohësh 3 karta të reja me:
-- ✓ Badge për llojin (Material, Produkt, Shërbim)
-- ✓ Titullin dhe përshkrimin
-- ✓ Çmimin (ose "On request")
-- ✓ Vendndodhjen
-- ✓ Etiketa eco (badge të gjelbërta)
