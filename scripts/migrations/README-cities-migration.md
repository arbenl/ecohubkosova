# Run Kosovo Cities Migration

This migration creates the `cities` table and populates it with Kosovo towns and cities.

## Prerequisites

- Supabase project set up
- Database connection string in `.env.local`

## Option 1: Run via Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the contents of `scripts/migrations/add-kosovo-cities.sql`
5. Paste into the SQL editor
6. Click **Run** or press `Ctrl+Enter`

## Option 2: Run via psql command line

```bash
# Make sure you have PostgreSQL client installed
# Replace with your Supabase database URL
psql "your-database-connection-string" < scripts/migrations/add-kosovo-cities.sql
```

## Option 3: Run via Node.js script

```bash
# Using the database URL from environment
node scripts/run-migration.js scripts/migrations/add-kosovo-cities.sql
```

## Verify Migration

After running, verify the cities were created:

```sql
SELECT COUNT(*) FROM cities;
-- Should return 36

SELECT name_sq, name_en, region
FROM cities
ORDER BY display_order
LIMIT 10;
```

## Rollback

If you need to remove the cities table:

```sql
DROP TABLE IF EXISTS cities;
```
