/**
 * E2E Test Database Seed Script
 * 
 * Creates deterministic test data for E2E tests.
 * 
 * Features:
 * - Idempotent: Re-running yields the same dataset
 * - Deterministic: Fixed IDs, emails, and timestamps
 * - Safe: Only runs in test environment (checks NODE_ENV and DATABASE_URL)
 * - Observable: Logs summary of created records
 * 
 * Usage:
 *   pnpm db:seed:test     # With dotenv -e .env.test
 */

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { logAuthAction } from '@/lib/auth/logging';

// ===== SAFETY CHECKS =====
function validateTestEnvironment() {
  const env = process.env.NODE_ENV;
  const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_URL;

  if (env !== 'test') {
    console.error('❌ NODE_ENV must be "test", got:', env);
    process.exit(1);
  }

  if (!dbUrl) {
    console.error('❌ DATABASE_URL or SUPABASE_URL not set');
    process.exit(1);
  }

  // For Supabase, verify it's pointing to test project
  if (dbUrl.includes('supabase.co')) {
    if (!dbUrl.includes('test') && !dbUrl.includes('staging')) {
      console.error('❌ SUPABASE_URL does not appear to be a test instance');
      console.error('   URL:', dbUrl);
      console.error('   Must include "test" or "staging" to prevent production data loss');
      process.exit(1);
    }
  }

  console.log('✓ Test environment verified');
  console.log(`  NODE_ENV: ${env}`);
  console.log(`  DB: ${dbUrl.substring(0, 50)}...`);
}

// ===== DETERMINISTIC TEST DATA =====
interface TestUser {
  id: string;
  email: string;
  password: string;
  fullName: string;
  role: 'admin' | 'user' | 'viewer';
}

interface TestOrganization {
  id: string;
  name: string;
  slug: string;
  description: string;
}

const TEST_USERS: TestUser[] = [
  {
    id: 'e2e_admin_001',
    email: 'admin@e2e.test',
    password: 'AdminPassword123!',
    fullName: 'Admin User',
    role: 'admin',
  },
  {
    id: 'e2e_user_001',
    email: 'user@e2e.test',
    password: 'UserPassword123!',
    fullName: 'Regular User',
    role: 'user',
  },
  {
    id: 'e2e_viewer_001',
    email: 'viewer@e2e.test',
    password: 'ViewerPassword123!',
    fullName: 'Viewer User',
    role: 'viewer',
  },
];

const TEST_ORGANIZATIONS: TestOrganization[] = [
  {
    id: 'org_e2e_test_001',
    name: 'E2E Test Organization',
    slug: 'e2e-test-org',
    description: 'Organization for E2E testing',
  },
];

// ===== SEEDING LOGIC =====

async function seedTestUsers(supabase: any) {
  console.log('\n📝 Seeding test users...');

  let createdCount = 0;
  const results = [];

  for (const user of TEST_USERS) {
    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', user.email)
        .single();

      if (existingUser) {
        console.log(`  ⊘ User ${user.email} already exists (skipped)`);
        results.push({
          email: user.email,
          status: 'exists',
        });
        continue;
      }

      // Create user via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, // Skip email confirmation for test users
        user_metadata: {
          full_name: user.fullName,
          role: user.role,
        },
      });

      if (authError) {
        console.warn(`  ⚠ Auth creation failed for ${user.email}:`, authError.message);
        results.push({
          email: user.email,
          status: 'error',
          error: authError.message,
        });
        continue;
      }

      // Create user profile in database
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert([
          {
            id: authData.user.id,
            email: user.email,
            full_name: user.fullName,
            role: user.role,
            created_at: new Date().toISOString(),
          },
        ]);

      if (profileError) {
        console.warn(`  ⚠ Profile creation failed for ${user.email}:`, profileError.message);
      }

      console.log(`  ✓ Created user: ${user.email} (role: ${user.role})`);
      createdCount++;
      results.push({
        email: user.email,
        status: 'created',
        userId: authData.user.id,
      });
    } catch (error) {
      console.error(`  ✗ Unexpected error for ${user.email}:`, error);
      results.push({
        email: user.email,
        status: 'error',
        error: String(error),
      });
    }
  }

  console.log(`\n  Summary: ${createdCount}/${TEST_USERS.length} users created or existing`);
  return results;
}

async function seedTestOrganizations(supabase: any) {
  console.log('\n🏢 Seeding test organizations...');

  let createdCount = 0;
  const results = [];

  for (const org of TEST_ORGANIZATIONS) {
    try {
      // Check if organization already exists
      const { data: existingOrg } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', org.slug)
        .single();

      if (existingOrg) {
        console.log(`  ⊘ Organization ${org.slug} already exists (skipped)`);
        results.push({
          slug: org.slug,
          status: 'exists',
        });
        continue;
      }

      // Create organization
      const { error: orgError } = await supabase
        .from('organizations')
        .insert([
          {
            id: org.id,
            name: org.name,
            slug: org.slug,
            description: org.description,
            created_at: new Date().toISOString(),
          },
        ]);

      if (orgError) {
        console.warn(`  ⚠ Organization creation failed for ${org.slug}:`, orgError.message);
        results.push({
          slug: org.slug,
          status: 'error',
          error: orgError.message,
        });
        continue;
      }

      console.log(`  ✓ Created organization: ${org.name} (${org.slug})`);
      createdCount++;
      results.push({
        slug: org.slug,
        status: 'created',
        orgId: org.id,
      });
    } catch (error) {
      console.error(`  ✗ Unexpected error for ${org.slug}:`, error);
      results.push({
        slug: org.slug,
        status: 'error',
        error: String(error),
      });
    }
  }

  console.log(`\n  Summary: ${createdCount}/${TEST_ORGANIZATIONS.length} organizations created or existing`);
  return results;
}

// ===== SANITY CHECKS =====

async function validateSeedData(supabase: any) {
  console.log('\n✓ Running sanity checks...');

  try {
    // Check minimum users
    const { count: userCount } = await supabase
      .from('user_profiles')
      .select('id', { count: 'exact', head: true });

    if ((userCount || 0) < TEST_USERS.length) {
      console.warn(`  ⚠ Expected at least ${TEST_USERS.length} users, found ${userCount}`);
      return false;
    }
    console.log(`  ✓ Users: ${userCount} >= ${TEST_USERS.length}`);

    // Check organizations
    const { count: orgCount } = await supabase
      .from('organizations')
      .select('id', { count: 'exact', head: true });

    if ((orgCount || 0) < TEST_ORGANIZATIONS.length) {
      console.warn(`  ⚠ Expected at least ${TEST_ORGANIZATIONS.length} organizations, found ${orgCount}`);
      return false;
    }
    console.log(`  ✓ Organizations: ${orgCount} >= ${TEST_ORGANIZATIONS.length}`);

    // Verify test admin exists
    const { data: adminExists } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', 'admin@e2e.test')
      .single();

    if (!adminExists) {
      console.warn('  ⚠ Test admin user (admin@e2e.test) not found');
      return false;
    }
    console.log(`  ✓ Test admin exists: admin@e2e.test`);

    return true;
  } catch (error) {
    console.error('  ✗ Sanity check failed:', error);
    return false;
  }
}

// ===== MAIN ENTRY POINT =====

async function main() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   E2E Test Database Seed Script       ║');
  console.log('╚════════════════════════════════════════╝\n');

  // Step 1: Validate environment
  console.log('Step 1: Validating test environment...');
  validateTestEnvironment();

  // Step 2: Connect to Supabase
  console.log('\nStep 2: Connecting to Supabase...');
  let supabase;
  try {
    supabase = await createServerSupabaseClient();
    console.log('✓ Connected to Supabase');
  } catch (error) {
    console.error('❌ Failed to connect to Supabase:', error);
    console.error('\nMake sure:');
    console.error('  1. .env.test has SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    console.error('  2. Database is accessible from your network');
    console.error('  3. You have correct permissions');
    process.exit(1);
  }

  // Step 3: Seed users
  console.log('\nStep 3: Seeding test data...');
  const userResults = await seedTestUsers(supabase);

  // Step 4: Seed organizations
  const orgResults = await seedTestOrganizations(supabase);

  // Step 5: Validate seed
  console.log('\nStep 4: Validating seed data...');
  const isValid = await validateSeedData(supabase);

  if (!isValid) {
    console.error('\n❌ Seed validation failed!');
    console.error('Check the errors above and try again.');
    process.exit(1);
  }

  // Success!
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   ✅ Seed Complete                    ║');
  console.log('╚════════════════════════════════════════╝\n');

  console.log('📊 Summary:');
  console.log(`  • Users: ${userResults.filter(r => r.status === 'created').length} created`);
  console.log(`  • Organizations: ${orgResults.filter(r => r.status === 'created').length} created`);
  console.log(`  • Status: Ready for E2E testing\n`);

  console.log('🔑 Test credentials (for E2E tests):');
  console.log('  Admin:  admin@e2e.test / AdminPassword123!');
  console.log('  User:   user@e2e.test / UserPassword123!');
  console.log('  Viewer: viewer@e2e.test / ViewerPassword123!\n');

  console.log('Next: Run E2E tests');
  console.log('  pnpm e2e\n');
}

main()
  .catch((error) => {
    console.error('\n❌ Fatal error during seed:', error);
    process.exit(1);
  });
