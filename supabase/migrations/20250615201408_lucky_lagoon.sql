/*
  # Fix user signup database error

  1. Database Functions
    - Update `handle_new_user` function to properly create profile entries
    - Ensure the function handles all required fields correctly

  2. Triggers
    - Recreate the trigger to ensure it fires correctly on user creation
    - Set proper timing and configuration

  3. Security
    - Maintain existing RLS policies
    - Ensure proper security definer settings
*/

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop and recreate the handle_new_user function
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();