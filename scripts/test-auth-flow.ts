import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load environment variables manually
function loadEnv() {
  try {
    const envPath = resolve('.env.local');
    const envContent = readFileSync(envPath, 'utf-8');
    const envVars: Record<string, string> = {};

    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
      }
    });

    Object.assign(process.env, envVars);
  } catch (error) {
    console.warn('Could not load .env.local file');
  }
}

loadEnv();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function testAuthFlow() {
  console.log('🧪 Testing EcoHub Kosova Authentication Flow\n');

  try {
    // Test 1: Check database connection
    console.log('1. Testing database connection...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('artikuj')  // Use Albanian table name as per schema
      .select('count', { count: 'exact', head: true });

    if (healthError) {
      console.error('❌ Database connection failed:', healthError.message);
      return;
    }
    console.log('✅ Database connection successful');

    // Test 2: Check if admin user exists
    console.log('\n2. Checking admin user...');
    const { data: adminUser, error: adminError } = await supabase
      .from('users')  // Use English table name
      .select('id, email, role')
      .eq('role', 'Admin')  // Use English role name
      .single();

    if (adminError && adminError.code !== 'PGRST116') {
      console.error('❌ Admin user check failed:', adminError.message);
      return;
    }

    if (adminUser) {
      console.log('✅ Admin user found:', adminUser.email);
    } else {
      console.log('⚠️  No admin user found');
    }

    // Test 3: Test login with test credentials
    console.log('\n3. Testing login flow...');
    const testEmail = process.env.TEST_USER_EMAIL || 'test@example.com';
    const testPassword = process.env.TEST_USER_PASSWORD || 'password123';

    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (loginError) {
      if (loginError.message.includes('Invalid login credentials')) {
        console.log('⚠️  Test user not found (expected for new setup)');
      } else {
        console.error('❌ Login test failed:', loginError.message);
      }
    } else {
      console.log('✅ Login successful for:', loginData.user?.email);

      // Test 4: Check user profile
      console.log('\n4. Testing user profile access...');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('id', loginData.user.id)
        .single();

      if (profileError) {
        console.error('❌ Profile access failed:', profileError.message);
      } else {
        console.log('✅ Profile access successful:', profile.full_name || 'No name set');
      }

      // Logout
      await supabase.auth.signOut();
      console.log('✅ Logout successful');
    }

    // Test 5: Check articles
    console.log('\n5. Testing articles access...');
    const { data: articles, error: articlesError } = await supabase
      .from('artikuj')
      .select('id, title, is_published')
      .limit(5);

    if (articlesError) {
      console.error('❌ Articles access failed:', articlesError.message);
    } else {
      console.log(`✅ Articles access successful (${articles.length} articles found)`);
      if (articles.length > 0) {
        console.log('   Sample article:', articles[0].title);
      }
    }

    console.log('\n🎉 Authentication flow test completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

testAuthFlow();