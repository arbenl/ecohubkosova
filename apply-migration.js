// Development helper script – not part of production build.
// This script applies database migrations from the supabase/migrations folder.

const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

async function applyMigration() {
  const client = new Client({
    connectionString:
      process.env.SUPABASE_DB_URL ||
      'postgresql://postgres.xjyseqtfuxcuviiankhy:1GnOqYqUeGiUf89v@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require',
    ssl: {
      rejectUnauthorized: false,
    },
  })

  try {
    console.log('Connecting to database...')
    await client.connect()
    console.log('✓ Connected')

    const migrationPath = path.join(__dirname, 'supabase/migrations/20251118000000_rename_columns_to_english.sql')
    const sql = fs.readFileSync(migrationPath, 'utf8')

    console.log('Applying migration...')
    await client.query(sql)
    console.log('✓ Migration applied successfully!')
  } catch (error) {
    console.error('✗ Migration failed:', error.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

applyMigration()
