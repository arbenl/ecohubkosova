-- Add strict search_path to SECURITY DEFINER functions to pass Supabase Security Advisor checks


    ALTER FUNCTION public.is_admin(uuid) SET search_path TO public;
    ALTER FUNCTION public.handle_new_user() SET search_path TO public;
  
