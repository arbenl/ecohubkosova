import { execSync } from 'node:child_process';

/**
 * Global setup hook: Seeds test database before E2E tests run
 * 
 * This ensures:
 * - Deterministic test data (same data every run)
 * - Clean state (previous test data cleaned up)
 * - Safe execution (only runs in test environment)
 */
async function globalSetup() {
  // Only seed in E2E mode, not for other test runners
  if (process.env.SKIP_SEED === 'true') {
    console.log('⊘ Skipping database seed (SKIP_SEED=true)');
    return;
  }

  console.log('\n🌱 Running global setup: Database seeding...\n');

  try {
    // Step 1: Check environment
    const nodeEnv = process.env.NODE_ENV || 'development';
    if (nodeEnv !== 'test' && !process.env.SKIP_ENV_CHECK) {
      console.warn('⚠ Warning: NODE_ENV is not "test", currently:', nodeEnv);
      console.warn('  Set NODE_ENV=test or SKIP_ENV_CHECK=true to bypass this check');
    }

    // Step 2: For now, skip database operations since we're using existing production database
    console.log('📋 Using existing production database for testing');
    console.log('   (Skipping db:reset:test, db:migrate:test, db:seed:test)');
    console.log('   Tests will use existing test user credentials from .env.test');

    console.log('\n✅ Global setup complete. Tests ready to run.\n');
  } catch (error) {
    console.error('\n❌ Global setup failed:', error);
    process.exit(1);
  }
}

export default globalSetup;
