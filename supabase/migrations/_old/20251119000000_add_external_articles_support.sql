-- Add external article support to articles table
-- This migration adds support for external articles that are fetched from URLs

ALTER TABLE artikuj
ADD COLUMN external_url TEXT,
ADD COLUMN original_language TEXT DEFAULT 'en';

-- Make content column nullable since external articles won't have local content
ALTER TABLE artikuj
ALTER COLUMN content DROP NOT NULL;

-- Add comment to explain the new columns
COMMENT ON COLUMN artikuj.external_url IS 'URL to fetch article content from for external articles';
COMMENT ON COLUMN artikuj.original_language IS 'Original language of the external article (e.g., en, sq)';