// Development helper script – not part of production build.
// This script applies a trigger function fix for handling new user signups.

const { Client } = require('pg')
const fs = require('fs')

async function applyTriggerFix() {
  const client = new Client({
    connectionString:
      'postgresql://postgres.xjyseqtfuxcuviiankhy:1GnOqYqUeGiUf89v@aws-1-eu-west-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false },
  })

  try {
    await client.connect()
    console.log('✓ Connected to database')

    const sql = fs.readFileSync('fix-trigger-function.sql', 'utf8')

    console.log('\nApplying trigger function fix...')
    await client.query(sql)

    console.log('✓ Trigger function updated successfully!')

    // Verify the new function
    const verify = await client.query(`
      SELECT pg_get_functiondef(oid) as definition
      FROM pg_proc
      WHERE proname = 'handle_new_user'
    `)

    console.log('\n=== UPDATED FUNCTION (first 500 chars) ===')
    console.log(verify.rows[0].definition.substring(0, 500) + '...')

    console.log('\n✅ Fix applied! New signups will now work with English column names.')

    await client.end()
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error('\nFull error:', error)
    process.exit(1)
  }
}

applyTriggerFix()
