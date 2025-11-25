#!/bin/bash
# Apply Supabase seed migrations for eco organizations
# Usage: ./apply-eco-seeds.sh

set -e  # Exit on error

echo "🚀 Applying Eco Organizations Seeds to Supabase"
echo "================================================"
echo ""

# Use a dedicated env var for direct connection
if [ -z "$SUPABASE_DB_URL_DIRECT" ]; then
  echo "❌ Error: SUPABASE_DB_URL_DIRECT environment variable is not set"
  echo ""
  echo "Set it to your DIRECT Postgres URL (port 5432), e.g.:"
  echo "  export SUPABASE_DB_URL_DIRECT='postgresql://postgres:[PASSWORD]@db.xjyseqtfuxcuviiankhy.supabase.co:5432/postgres'"
  exit 1
fi

echo "✅ Direct database URL found (5432)"
echo "📦 Project: xjyseqtfuxcuviiankhy"
echo ""

# Apply all pending migrations (including seeds)
echo "🔄 Applying migrations..."
pnpm dlx supabase db push --db-url "$SUPABASE_DB_URL_DIRECT"

echo ""
echo "✅ Migrations applied successfully!"
echo ""

echo "🔍 Verifying seed data..."
echo ""

echo "Counting eco_organizations..."
pnpm dlx supabase db execute --db-url "$SUPABASE_DB_URL_DIRECT" \
  "SELECT COUNT(*) as eco_org_count FROM eco_organizations;" \
  --output table

echo ""
echo "Sample eco organizations:"
pnpm dlx supabase db execute --db-url "$SUPABASE_DB_URL_DIRECT" \
  "SELECT o.name, o.location, eo.org_role, eo.verification_status 
   FROM eco_organizations eo 
   JOIN organizations o ON eo.organization_id = o.id 
   ORDER BY o.name 
   LIMIT 5;" \
  --output table