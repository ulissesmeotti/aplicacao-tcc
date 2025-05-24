/*
  # Fix Authentication Setup

  1. Changes
    - Create auth schema and tables if they don't exist
    - Set up profiles table with proper RLS
    - Configure auth settings
    - Fix duplicate policy issues
*/

-- Create auth schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS auth;

-- Create auth.users table if it doesn't exist
CREATE TABLE IF NOT EXISTS auth.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  encrypted_password text NOT NULL,
  confirmed_at timestamptz DEFAULT NOW(),
  email_confirmed_at timestamptz DEFAULT NOW(),
  last_sign_in_at timestamptz,
  raw_app_meta_data jsonb DEFAULT '{}'::jsonb,
  raw_user_meta_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW(),
  phone text,
  phone_confirmed_at timestamptz,
  confirmation_token text,
  recovery_token text,
  role text DEFAULT 'authenticated',
  aud text DEFAULT 'authenticated'
);

-- Create auth.sessions table if it doesn't exist
CREATE TABLE IF NOT EXISTS auth.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW(),
  factor_id uuid,
  aal text
);

-- Create auth.refresh_tokens table if it doesn't exist
CREATE TABLE IF NOT EXISTS auth.refresh_tokens (
  id bigserial PRIMARY KEY,
  token text NOT NULL UNIQUE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  revoked boolean DEFAULT false,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW(),
  parent text
);

-- Safely create profiles table
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

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Safely drop existing policies before creating new ones
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create new policies
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create or replace function to handle new user creation
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

-- Safely create trigger
DO $$ BEGIN
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS users_email_idx ON auth.users(email);
CREATE INDEX IF NOT EXISTS users_instance_id_idx ON auth.users(id);
CREATE INDEX IF NOT EXISTS refresh_tokens_token_idx ON auth.refresh_tokens(token);
CREATE INDEX IF NOT EXISTS refresh_tokens_user_id_idx ON auth.refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON auth.sessions(user_id);
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON public.profiles(id);

-- Insert test user if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'ulissesmeotti@gmail.com') THEN
    INSERT INTO auth.users (
      email,
      encrypted_password,
      confirmed_at,
      email_confirmed_at
    ) VALUES (
      'ulissesmeotti@gmail.com',
      crypt('123456', gen_salt('bf')),
      NOW(),
      NOW()
    );
  END IF;
EXCEPTION
  WHEN others THEN NULL;
END $$;