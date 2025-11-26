#!/usr/bin/env node

/**
 * Script to create an admin user for development
 * Usage: node scripts/create-admin-user.mjs
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local not found');
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
const adminEmail = 'admin@ecohub.test';
const adminPassword = 'Admin123!';

if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
}

console.log('🔐 Creating admin user...');
console.log(`   Email: ${adminEmail}`);
console.log(`   Supabase URL: ${supabaseUrl}`);

const supabase = createClient(supabaseUrl, serviceRoleKey);

(async () => {
    try {
        // Check if admin user already exists in auth
        const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) {
            console.error('❌ Failed to list users:', listError.message);
            process.exit(1);
        }

        const existingAdmin = existingUsers.users.find(u => u.email === adminEmail);
        let adminUserId;

        if (existingAdmin) {
            console.log('⚠️  Admin user already exists in auth');
            adminUserId = existingAdmin.id;
        } else {
            // Create admin user in Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                email: adminEmail,
                password: adminPassword,
                email_confirm: true,
                user_metadata: {
                    full_name: 'Admin User',
                    role: 'Admin',
                },
            });

            if (authError) {
                console.error('❌ Failed to create admin user in auth:', authError.message);
                process.exit(1);
            }

            console.log('✅ Admin user created in Supabase Auth');
            adminUserId = authData.user.id;
        }

        // Check if admin user exists in users table
        const { data: existingDbUser, error: dbCheckError } = await supabase
            .from('users')
            .select('id')
            .eq('id', adminUserId)
            .single();

        if (dbCheckError && dbCheckError.code !== 'PGRST116') { // PGRST116 = no rows returned
            console.error('❌ Failed to check users table:', dbCheckError.message);
            process.exit(1);
        }

        if (existingDbUser) {
            console.log('⚠️  Admin user already exists in database');
        } else {
            // Create admin user in database
            const { error: dbError } = await supabase
                .from('users')
                .insert({
                    id: adminUserId,
                    full_name: 'Admin User',
                    email: adminEmail,
                    location: 'Kosovo',
                    role: 'Admin',
                    is_approved: true,
                });

            if (dbError) {
                console.error('❌ Failed to create admin user in database:', dbError.message);
                process.exit(1);
            }

            console.log('✅ Admin user created in database');
        }

        console.log('');
        console.log('🎉 Admin user setup complete!');
        console.log(`   Email: ${adminEmail}`);
        console.log(`   Password: ${adminPassword}`);
        console.log('');
        console.log('You can now log in as admin at /sq/login');

    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
})();