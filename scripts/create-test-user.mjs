#!/usr/bin/env node

/**
 * Script to create a test user in Supabase using the Node.js admin client
 * Usage: node scripts/create-test-user.mjs
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load .env.test
const envPath = path.join(process.cwd(), '.env.test');
if (!fs.existsSync(envPath)) {
    console.error('❌ .env.test not found');
    process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};

envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, value] = trimmed.split('=');
        envVars[key] = value.replace(/^"(.*)"$/, '$1');
    }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = envVars.SUPABASE_SERVICE_ROLE_KEY;
const testEmail = envVars.TEST_USER_EMAIL;
const testPassword = envVars.TEST_USER_PASSWORD;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

console.log('🔐 Creating test user in Supabase...');
console.log(`   Email: ${testEmail}`);
console.log(`   Supabase URL: ${supabaseUrl}`);

const supabase = createClient(supabaseUrl, serviceRoleKey);

(async () => {
    try {
        const { data, error } = await supabase.auth.admin.createUser({
            email: testEmail,
            password: testPassword,
            email_confirm: true,
            user_metadata: {
                test_user: true,
            },
        });

        if (error) {
            if (error.message.includes('already exists')) {
                console.log('⚠️  Test user already exists (this is fine)');
                console.log(`   Email: ${testEmail}`);
            } else {
                console.error('❌ Failed to create test user');
                console.error(`   Error: ${error.message}`);
                process.exit(1);
            }
        } else {
            console.log('✅ Test user created successfully!');
            console.log(`   User ID: ${data.user.id}`);
        }

        console.log('');
        console.log('You can now run the E2E tests with:');
        console.log('  pnpm exec playwright test e2e/auth.e2e.spec.ts');
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
})();
