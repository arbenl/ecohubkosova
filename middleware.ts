import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Refresh session if expired - required for Server Components
  // This also ensures the session is available for subsequent server-side operations
  await supabase.auth.getSession();

  // Protect /admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      // Redirect unauthenticated users to the login page
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/auth/kycu'; // Assuming /auth/kycu is your login page
      redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Optionally, you could fetch the user's role here from the public.users table
    // and redirect if they are not an admin. This would require a server-side
    // Supabase client call within the middleware, which is possible but adds latency.
    // For now, we'll rely on client-side checks for admin role within the admin pages,
    // but the primary protection (authenticated vs. unauthenticated) is handled here.
  }

  // Protect /dashboard and /profili routes
  if (req.nextUrl.pathname.startsWith('/dashboard') || req.nextUrl.pathname.startsWith('/profili')) {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/auth/kycu';
      redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Protect /tregu/shto route
  if (req.nextUrl.pathname.startsWith('/tregu/shto')) {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/auth/kycu';
      redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return res;
}

// Define which paths the middleware should run on
export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/profili/:path*',
    '/tregu/shto/:path*',
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder (e.g. images)
     * - auth routes (allow unauthenticated access to login/signup)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$|auth).*)',
  ],
};
