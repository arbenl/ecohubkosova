// Development helper script – not part of production build.
// This script tests database queries after migration to English column names.

const { Client } = require('pg')

async function testQueries() {
  const client = new Client({
    connectionString:
      process.env.SUPABASE_DB_URL ||
      'postgresql://postgres.xjyseqtfuxcuviiankhy:1GnOqYqUeGiUf89v@aws-1-eu-west-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false },
  })

  try {
    await client.connect()
    console.log('✓ Connected to database')

    // Test 1: Simple select with English columns
    console.log('\n1. Testing simple SELECT with English columns:')
    const usersResult = await client.query(`
      SELECT id, full_name, email, location, role, is_approved 
      FROM users 
      LIMIT 3
    `)
    console.log(`✓ Found ${usersResult.rows.length} users`)
    usersResult.rows.forEach((u) => {
      console.log(
        `  - ${u.full_name} (${u.email}) - Role: ${u.role}, Approved: ${u.is_approved}`
      )
    })

    // Test 2: Join query like the application does
    console.log('\n2. Testing JOIN query (users + organizations):')
    const joinResult = await client.query(`
      SELECT 
        u.id, u.full_name, u.email, u.location, u.role, u.is_approved,
        o.id as org_id, o.name as org_name, o.type as org_type
      FROM users u
      LEFT JOIN organization_members om ON om.user_id = u.id AND om.is_approved = true
      LEFT JOIN organizations o ON o.id = om.organization_id
      LIMIT 3
    `)
    console.log(`✓ Found ${joinResult.rows.length} user records with org data`)
    joinResult.rows.forEach((r) => {
      console.log(`  - ${r.full_name}: ${r.org_name || 'No organization'}`)
    })

    // Test 3: Check constraints are working
    console.log('\n3. Testing constraints:')
    const constraintsResult = await client.query(`
      SELECT constraint_name, constraint_type
      FROM information_schema.table_constraints
      WHERE table_name IN ('users', 'organizations', 'organization_members')
      AND constraint_type IN ('CHECK', 'PRIMARY KEY', 'FOREIGN KEY')
      ORDER BY table_name, constraint_type
    `)
    console.log(`✓ Found ${constraintsResult.rows.length} constraints`)

    // Test 4: Verify RLS policies
    console.log('\n4. Testing RLS policies:')
    const rlsResult = await client.query(`
      SELECT schemaname, tablename, policyname
      FROM pg_policies
      WHERE tablename IN ('users', 'organizations', 'organization_members', 'artikuj', 'tregu_listime')
      ORDER BY tablename
    `)
    console.log(`✓ Found ${rlsResult.rows.length} RLS policies`)

    console.log('\n✅ All database tests passed! Migration was successful.')
  } catch (error) {
    console.error('\n❌ Database test failed:')
    console.error('Error:', error.message)
    console.error('\nFull error:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

testQueries()
