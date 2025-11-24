#!/bin/bash
# Apply seeds using direct connection (not pooler)
# Pooler connections cause "prepared statement already exists" errors

set -e

if [ -z "$SUPABASE_DB_URL" ]; then
  echo "❌ Error: SUPABASE_DB_URL not set"
  echo ""
  echo "For Supabase, use the DIRECT connection (port 5432), not pooler (port 6543):"
  echo ""
  echo "  export SUPABASE_DB_URL='postgresql://postgres.xjyseqtfuxcuviiankhy:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:5432/postgres'"
  echo ""
  echo "Get it from: Supabase Dashboard → Settings → Database → Connection string → Direct connection"
  exit 1
fi

# Check if using pooler (port 6543) - warn user
if [[ "$SUPABASE_DB_URL" == *":6543/"* ]]; then
  echo "⚠️  WARNING: You're using a pooler connection (port 6543)"
  echo "   This may cause 'prepared statement already exists' errors"
  echo ""
  echo "   Please use the DIRECT connection instead (port 5432):"
  echo "   postgresql://postgres.xjyseqtfuxcuviiankhy:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"
  echo ""
  read -p "Continue anyway? [y/N] " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

echo "🌱 Applying eco organizations seeds..."
echo ""

# Apply recycling companies seed
echo "📦 [1/2] Recycling companies..."
psql "$SUPABASE_DB_URL" -f supabase/migrations/20251122100000_seed_recycling_companies.sql -q
echo "✅ Recycling companies seed applied"

# Apply eco organizations seed  
echo "📦 [2/2] Eco organizations..."
psql "$SUPABASE_DB_URL" -f supabase/migrations/20251122120000_seed_eco_organizations.sql -q
echo "✅ Eco organizations seed applied"

echo ""
echo "🔍 Verifying..."
echo ""

# Count
COUNT=$(psql "$SUPABASE_DB_URL" -t -c "SELECT COUNT(*) FROM eco_organizations;")
echo "✅ Eco organizations count: $COUNT"

if [ "$COUNT" -ge 12 ]; then
  echo "✅ Success! All 12 organizations seeded."
else
  echo "⚠️  Warning: Expected 12 organizations, found $COUNT"
fi

echo ""
echo "Sample organizations:"
psql "$SUPABASE_DB_URL" -c "SELECT o.name, eo.org_role FROM eco_organizations eo JOIN organizations o ON eo.organization_id = o.id ORDER BY o.name LIMIT 5;"

echo ""
echo "✅ Done! Check /sq/eco-organizations in your app."
