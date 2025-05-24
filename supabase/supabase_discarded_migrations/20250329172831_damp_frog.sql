/*
  # Authentication and Profile Tables Setup

  1. New Tables
    - profiles
      - id (uuid, primary key, references auth.users)
      - updated_at (timestamp with timezone)
      - full_name (text)
      - avatar_url (text, optional)

  2. Security
    - Enable RLS on profiles table
    - Add policies for authenticated users to:
      - Read their own profile
      - Update their own profile
    - Create trigger to automatically create profile on user signup

  3. Changes
    - Safe creation of tables and policies
    - Automatic profile creation for new users
*/

-- Create profiles table if it doesn't exist
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    updated_at timestamptz DEFAULT now(),
    full_name text NOT NULL,
    avatar_url text
  );
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Safely create policies for profiles table
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
  CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

  DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
  CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    new.id,
    COALESCE(
      new.raw_user_meta_data->>'full_name',
      split_part(new.email, '@', 1)
    )
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Safely create trigger for new user handling
DO $$ BEGIN
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

-- Create index for faster lookups
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON public.profiles(id);
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;