import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function testAuth() {
  console.log('Testing authentication...');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'arben.lila@gmail.com',
    password: '111111'
  });

  if (error) {
    console.error('Auth error:', error.message);
  } else {
    console.log('Auth successful! User:', data.user?.email);
    console.log('Session exists:', !!data.session);
  }
}

testAuth();