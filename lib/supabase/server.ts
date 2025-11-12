import { createServerComponentClient, createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { cache } from 'react';

// This function creates a Supabase client specifically for Server Components.
// It's cached to ensure that a single instance is used across multiple calls within the same request.
export const createServerSupabaseClient = cache(() => {
  const cookieStore = cookies();
  return createServerComponentClient({ cookies: () => cookieStore });
});

// This function creates a Supabase client for Route Handlers (API routes) and Server Actions.
// It also uses cookies to manage the session.
export const createRouteHandlerSupabaseClient = cache(() => {
  const cookieStore = cookies();
  return createRouteHandlerClient({ cookies: () => cookieStore });
});

// Note: createMiddlewareClient is typically used directly within middleware.ts
// and doesn't usually need to be exported from a central utility file like this.
// We will address middleware in the next step.
