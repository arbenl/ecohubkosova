-- ============================================================================
-- Migration: Normalize Organization Contact Info (Batch 1)
-- Date: 2025-11-24
-- Purpose: Move contact data from eco_organizations.metadata JSONB into
--          explicit columns on organizations table for better performance,
--          type safety, and maintainability.
-- ============================================================================

-- Add new contact columns to organizations table (idempotent)
DO $$
BEGIN
  -- Add contact_phone column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'organizations'
      AND column_name = 'contact_phone'
  ) THEN
    ALTER TABLE public.organizations ADD COLUMN contact_phone TEXT;
  END IF;

  -- Add contact_website column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'organizations'
      AND column_name = 'contact_website'
  ) THEN
    ALTER TABLE public.organizations ADD COLUMN contact_website TEXT;
  END IF;
END $$;

-- Backfill contact data from eco_organizations.metadata
-- Only update NULL values to preserve any existing explicit data
UPDATE public.organizations org
SET
  contact_phone = COALESCE(
    org.contact_phone,
    (
      SELECT COALESCE(
        eco.metadata->>'phone',
        eco.metadata->>'contact_phone'
      )
      FROM public.eco_organizations eco
      WHERE eco.organization_id = org.id
      LIMIT 1
    )
  ),
  contact_website = COALESCE(
    org.contact_website,
    (
      SELECT eco.metadata->>'website'
      FROM public.eco_organizations eco
      WHERE eco.organization_id = org.id
      LIMIT 1
    )
  ),
  contact_person = COALESCE(
    org.contact_person,
    (
      SELECT eco.metadata->>'contact_person'
      FROM public.eco_organizations eco
      WHERE eco.organization_id = org.id
      LIMIT 1
    )
  ),
  contact_email = COALESCE(
    org.contact_email,
    (
      SELECT eco.metadata->>'contact_email'
      FROM public.eco_organizations eco
      WHERE eco.organization_id = org.id
      LIMIT 1
    )
  )
WHERE EXISTS (
  SELECT 1
  FROM public.eco_organizations eco
  WHERE eco.organization_id = org.id
    AND (
      eco.metadata->>'phone' IS NOT NULL
      OR eco.metadata->>'contact_phone' IS NOT NULL
      OR eco.metadata->>'website' IS NOT NULL
      OR eco.metadata->>'contact_person' IS NOT NULL
      OR eco.metadata->>'contact_email' IS NOT NULL
    )
);

-- Add comment to metadata column indicating deprecation
COMMENT ON COLUMN public.eco_organizations.metadata IS
  'DEPRECATED for contact fields: Use organizations.contact_phone, contact_website, contact_person, contact_email instead. Metadata should only contain eco-specific data (certifications, processing details, etc.). Contact fields will be removed from metadata in v3.';

-- Create index on new columns for better query performance (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_organizations_contact_phone
  ON public.organizations(contact_phone)
  WHERE contact_phone IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_organizations_contact_website
  ON public.organizations(contact_website)
  WHERE contact_website IS NOT NULL;

-- ============================================================================
-- Verification Query (for manual testing)
-- ============================================================================
-- Run this after migration to verify backfill:
--
-- SELECT
--   org.name,
--   org.contact_email,
--   org.contact_phone,
--   org.contact_website,
--   org.contact_person,
--   eco.metadata->>'phone' AS old_phone,
--   eco.metadata->>'website' AS old_website
-- FROM organizations org
-- LEFT JOIN eco_organizations eco ON eco.organization_id = org.id
-- WHERE eco.id IS NOT NULL
-- LIMIT 10;
