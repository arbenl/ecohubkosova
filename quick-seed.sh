#!/bin/bash
# Quick seed application - runs the SQL files directly
# Usage: ./quick-seed.sh

set -e

if [ -z "$SUPABASE_DB_URL" ]; then
  echo "❌ Set SUPABASE_DB_URL first"
  echo "export SUPABASE_DB_URL='postgresql://postgres:[PASSWORD]@db.xjyseqtfuxcuviiankhy.supabase.co:5432/postgres'"
  exit 1
fi

echo "🌱 Applying seed migrations..."

# Apply recycling companies seed
echo "📦 Seed 1: Recycling companies..."
psql "$SUPABASE_DB_URL" -f supabase/migrations/20251122100000_seed_recycling_companies.sql

# Apply eco organizations seed
echo "📦 Seed 2: Eco organizations..."
psql "$SUPABASE_DB_URL" -f supabase/migrations/20251122120000_seed_eco_organizations.sql

# Verify
echo ""
echo "✅ Seeds applied! Verifying..."
psql "$SUPABASE_DB_URL" -c "SELECT COUNT(*) as count FROM eco_organizations;"
psql "$SUPABASE_DB_URL" -c "SELECT o.name, eo.org_role FROM eco_organizations eo JOIN organizations o ON eo.organization_id = o.id ORDER BY o.name LIMIT 5;"

echo ""
echo "✅ Done!"
