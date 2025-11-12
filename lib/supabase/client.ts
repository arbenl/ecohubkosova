import { createBrowserClient } from '@supabase/ssr';

// This function creates a Supabase client specifically for client-side operations.
// It's designed to be called within client components or browser-side code.
export const createClientSupabaseClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        storageKey: 'eco-hub-auth',
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
    }
  );
};
