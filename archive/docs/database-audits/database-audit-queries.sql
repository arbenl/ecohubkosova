-- Database Audit Validation Queries
-- Run with: psql "$SUPABASE_DB_URL" -f docs/database-audit-queries.sql
-- Date: 2025-11-24

\echo '=== DATABASE AUDIT VALIDATION QUERIES ==='
\echo ''

-- 1. Table row counts
\echo '1. TABLE ROW COUNTS'
\echo '-------------------'
SELECT 
  'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL
SELECT 'organizations', COUNT(*) FROM organizations
UNION ALL
SELECT 'eco_organizations', COUNT(*) FROM eco_organizations
UNION ALL
SELECT 'organization_members', COUNT(*) FROM organization_members
UNION ALL
SELECT 'eco_listings (V2)', COUNT(*) FROM eco_listings
UNION ALL
SELECT 'tregu_listime (V1)', COUNT(*) FROM tregu_listime
UNION ALL
SELECT 'eco_categories', COUNT(*) FROM eco_categories
ORDER BY table_name;

\echo ''
\echo '2. ORPHANED ECO_ORGANIZATIONS (should be 0)'
\echo '-------------------------------------------'
SELECT 
  eco.id, 
  eco.organization_id,
  'ORPHANED - no matching organization' AS issue
FROM eco_organizations eco
LEFT JOIN organizations org ON eco.organization_id = org.id
WHERE org.id IS NULL;

\echo ''
\echo '3. INCONSISTENT CONTACT DATA'
\echo '-----------------------------'
SELECT 
  org.name,
  org.contact_person AS org_contact_person,
  eco.metadata->>'contact_person' AS metadata_contact_person,
  org.contact_email AS org_email,
  eco.metadata->>'phone' AS metadata_phone,
  eco.metadata->>'website' AS metadata_website,
  CASE 
    WHEN org.contact_person != COALESCE(eco.metadata->>'contact_person', org.contact_person) 
    THEN 'MISMATCH: contact_person'
    ELSE 'OK'
  END AS status
FROM organizations org
JOIN eco_organizations eco ON eco.organization_id = org.id
WHERE 
  org.contact_person != COALESCE(eco.metadata->>'contact_person', org.contact_person)
  OR eco.metadata->>'phone' IS NOT NULL
  OR eco.metadata->>'website' IS NOT NULL;

\echo ''
\echo '4. ORGANIZATIONS WITHOUT ECO PROFILE'
\echo '-------------------------------------'
SELECT 
  org.id,
  org.name,
  org.type,
  org.is_approved,
  'No eco_organizations record' AS note
FROM organizations org
LEFT JOIN eco_organizations eco ON eco.organization_id = org.id
WHERE eco.id IS NULL
ORDER BY org.created_at DESC
LIMIT 10;

\echo ''
\echo '5. ORG ROLE vs TYPE MISALIGNMENT'
\echo '---------------------------------'
SELECT 
  org.name,
  org.type AS organizations_type,
  eco.org_role::text AS eco_org_role,
  CASE 
    WHEN org.type = eco.org_role::text THEN 'ALIGNED'
    ELSE 'MISALIGNED'
  END AS status
FROM organizations org
JOIN eco_organizations eco ON eco.organization_id = org.id
WHERE org.type != eco.org_role::text
ORDER BY org.name;

\echo ''
\echo '6. ECO_LISTINGS WITHOUT VALID CATEGORY'
\echo '---------------------------------------'
SELECT 
  el.id,
  el.title,
  el.category_id,
  'INVALID: category not found' AS issue
FROM eco_listings el
LEFT JOIN eco_categories cat ON el.category_id = cat.id
WHERE cat.id IS NULL;

\echo ''
\echo '7. ECO_LISTINGS WITHOUT ORGANIZATION'
\echo '-------------------------------------'
SELECT 
  el.id,
  el.title,
  el.organization_id,
  u.full_name AS creator,
  el.status,
  'No organization linked' AS note
FROM eco_listings el
LEFT JOIN users u ON el.created_by_user_id = u.id
WHERE el.organization_id IS NULL;

\echo ''
\echo '8. LISTINGS BY VERSION (V1 vs V2)'
\echo '----------------------------------'
SELECT 
  'V1 (tregu_listime)' AS version,
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE eshte_aprovuar = true) AS approved,
  COUNT(*) FILTER (WHERE eshte_aprovuar = false) AS pending
FROM tregu_listime
UNION ALL
SELECT 
  'V2 (eco_listings)',
  COUNT(*),
  COUNT(*) FILTER (WHERE status = 'ACTIVE'),
  COUNT(*) FILTER (WHERE status = 'DRAFT')
FROM eco_listings;

\echo ''
\echo '9. CONTACT INFO RESOLUTION COMPLEXITY'
\echo '--------------------------------------'
-- Shows how many listings require fallback logic
SELECT 
  COUNT(*) AS total_listings,
  COUNT(*) FILTER (WHERE org.contact_email IS NOT NULL) AS has_org_email,
  COUNT(*) FILTER (WHERE org.contact_email IS NULL AND u.email IS NOT NULL) AS fallback_to_user_email,
  COUNT(*) FILTER (WHERE org.contact_email IS NULL AND u.email IS NULL) AS no_contact_email,
  COUNT(*) FILTER (WHERE eco.metadata->>'phone' IS NOT NULL) AS has_metadata_phone,
  COUNT(*) FILTER (WHERE eco.metadata->>'website' IS NOT NULL) AS has_metadata_website
FROM eco_listings el
LEFT JOIN eco_organizations eco ON el.organization_id = eco.id
LEFT JOIN organizations org ON eco.organization_id = org.id
LEFT JOIN users u ON el.created_by_user_id = u.id;

\echo ''
\echo '10. ORGANIZATION_MEMBERS ROLE DISTRIBUTION'
\echo '-------------------------------------------'
SELECT 
  role_in_organization,
  COUNT(*) AS member_count,
  COUNT(*) FILTER (WHERE is_approved = true) AS approved,
  COUNT(*) FILTER (WHERE is_approved = false) AS pending
FROM organization_members
GROUP BY role_in_organization
ORDER BY member_count DESC;

\echo ''
\echo '11. ECO_ORGANIZATIONS VERIFICATION STATUS'
\echo '------------------------------------------'
SELECT 
  verification_status,
  COUNT(*) AS org_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) AS percentage
FROM eco_organizations
GROUP BY verification_status
ORDER BY org_count DESC;

\echo ''
\echo '12. LISTINGS BY FLOW TYPE (V2 only)'
\echo '------------------------------------'
SELECT 
  flow_type,
  COUNT(*) AS listing_count,
  COUNT(*) FILTER (WHERE status = 'ACTIVE') AS active,
  COUNT(*) FILTER (WHERE status = 'DRAFT') AS draft
FROM eco_listings
GROUP BY flow_type
ORDER BY listing_count DESC;

\echo ''
\echo '13. DUPLICATE ORGANIZATION_MEMBERS (should be 0)'
\echo '-------------------------------------------------'
SELECT 
  organization_id,
  user_id,
  COUNT(*) AS duplicate_count
FROM organization_members
GROUP BY organization_id, user_id
HAVING COUNT(*) > 1;

\echo ''
\echo '14. USERS WITHOUT ORGANIZATION MEMBERSHIP'
\echo '------------------------------------------'
SELECT 
  u.id,
  u.full_name,
  u.email,
  u.role,
  'No organization membership' AS note
FROM users u
LEFT JOIN organization_members om ON om.user_id = u.id
WHERE om.id IS NULL
  AND u.role != 'Admin'
ORDER BY u.created_at DESC
LIMIT 10;

\echo ''
\echo '15. METADATA FIELDS THAT SHOULD BE NORMALIZED'
\echo '----------------------------------------------'
SELECT 
  org.name,
  eco.metadata->>'phone' AS phone_in_metadata,
  eco.metadata->>'website' AS website_in_metadata,
  eco.metadata->>'contact_person' AS contact_person_in_metadata,
  'Should be moved to organizations table' AS recommendation
FROM eco_organizations eco
JOIN organizations org ON eco.organization_id = org.id
WHERE 
  eco.metadata->>'phone' IS NOT NULL
  OR eco.metadata->>'website' IS NOT NULL
  OR eco.metadata->>'contact_person' IS NOT NULL;

\echo ''
\echo '=== END OF VALIDATION QUERIES ==='
