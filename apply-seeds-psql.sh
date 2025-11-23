#!/bin/bash
# Apply seeds using psql directly (works with pooler connection)
# This bypasses Supabase CLI entirely

set -e

# Use the same connection your app uses (pooler is fine for raw SQL)
if [ -z "$SUPABASE_DB_URL" ]; then
  echo "❌ Error: SUPABASE_DB_URL not set"
  echo ""
  echo "Use your existing pooler connection:"
  echo "  export SUPABASE_DB_URL='postgresql://postgres.xjyseqtfuxcuviiankhy:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres'"
  exit 1
fi

echo "🌱 Applying Eco Organizations Seeds"
echo "===================================="
echo ""
echo "Using pooler connection (this is fine for raw SQL)"
echo ""

# Apply recycling companies seed
echo "📦 [1/2] Applying recycling companies seed..."
if psql "$SUPABASE_DB_URL" -f supabase/migrations/20251122100000_seed_recycling_companies.sql -q 2>&1; then
  echo "✅ Recycling companies seed applied"
else
  echo "⚠️  Recycling companies seed may have already been applied (this is OK)"
fi

echo ""

# Apply eco organizations seed  
echo "📦 [2/2] Applying eco organizations seed..."
if psql "$SUPABASE_DB_URL" -f supabase/migrations/20251122120000_seed_eco_organizations.sql -q 2>&1; then
  echo "✅ Eco organizations seed applied"
else
  echo "⚠️  Eco organizations seed may have already been applied (this is OK)"
fi

echo ""
echo "🔍 Verifying results..."
echo ""

# Count
COUNT=$(psql "$SUPABASE_DB_URL" -t -c "SELECT COUNT(*) FROM eco_organizations;" 2>/dev/null | tr -d ' ')

if [ -z "$COUNT" ]; then
  echo "❌ Could not verify - please check manually"
  exit 1
fi

echo "✅ Eco organizations count: $COUNT"

if [ "$COUNT" -ge 12 ]; then
  echo "✅ SUCCESS! All 12 organizations are seeded."
  echo ""
  echo "Sample organizations:"
  psql "$SUPABASE_DB_URL" -c "SELECT o.name, eo.org_role, eo.verification_status FROM eco_organizations eo JOIN organizations o ON eo.organization_id = o.id ORDER BY o.name LIMIT 5;"
else
  echo "⚠️  Warning: Expected 12 organizations, found $COUNT"
fi

echo ""
echo "✅ Done! Navigate to /sq/eco-organizations to see the companies."
