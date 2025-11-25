-- ============================================================================
-- FIX: Update handle_new_user() function to use ENGLISH column names
-- ============================================================================
-- 
-- PROBLEM: The trigger function on auth.users was still using Albanian column names
-- (emri_i_plote, vendndodhja, roli) but public.users now has English columns
-- (full_name, location, role). This caused "column does not exist" errors on signup.
--
-- SOLUTION: Update the function to use the new English column names.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Insert new user profile into public.users with ENGLISH column names
  -- Note: We explicitly use public.users to avoid ambiguity with auth.users
  INSERT INTO public.users (
    id, 
    email, 
    full_name,        -- Changed from: emri_i_plote
    location,         -- Changed from: vendndodhja
    role,             -- Changed from: roli
    is_approved       -- Using default: true
  )
  VALUES (
    NEW.id,
    NEW.email,
    -- Extract from Supabase auth metadata (also updated to use English keys if provided)
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',      -- Try English key first
      NEW.raw_user_meta_data->>'emri_i_plote',   -- Fallback to Albanian key for backward compat
      'Full Name'                                 -- Final fallback placeholder
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'location',       -- Try English key first
      NEW.raw_user_meta_data->>'vendndodhja',    -- Fallback to Albanian key for backward compat
      'Location'                                  -- Final fallback placeholder
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'role',           -- Try English key first
      NEW.raw_user_meta_data->>'roli',           -- Fallback to Albanian key for backward compat
      'Individ'                                   -- Default role (kept as Albanian enum value)
    ),
    true  -- is_approved defaults to true for new users
  );
  
  RETURN NEW;
END;
$$;

-- Verify the trigger still exists and is properly attached
-- (This is just a verification query - no changes made)
-- You can run: SELECT * FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created';
