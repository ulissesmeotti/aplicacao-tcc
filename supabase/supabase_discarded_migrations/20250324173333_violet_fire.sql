/*
  # Authentication System Setup

  1. Tables Created:
    - auth.users: Core authentication table
    - auth.sessions: User sessions management
    - auth.refresh_tokens: Token management
    - public.profiles: User profiles with additional info

  2. Security:
    - RLS enabled on public tables
    - Appropriate policies for data access
    - Auto-confirmation of email addresses
    - Automatic profile creation on user signup

  3. Indexes:
    - Optimized queries with appropriate indexes
    - Foreign key relationships
*/

-- Create auth schema
CREATE SCHEMA IF NOT EXISTS auth;

-- Create auth.users table
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

-- Create auth.sessions table
CREATE TABLE IF NOT EXISTS auth.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW(),
  factor_id uuid,
  aal text
);

-- Create auth.refresh_tokens table
CREATE TABLE IF NOT EXISTS auth.refresh_tokens (
  id bigserial PRIMARY KEY,
  token text UNIQUE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  revoked boolean DEFAULT false,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW(),
  parent text
);

-- Create public.profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at timestamptz DEFAULT NOW(),
  full_name text NOT NULL,
  avatar_url text
);

-- Enable RLS on public tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
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

-- Create function to handle new user creation
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

-- Create trigger for new user handling
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS users_email_idx ON auth.users(email);
CREATE INDEX IF NOT EXISTS users_instance_id_idx ON auth.users(id);
CREATE INDEX IF NOT EXISTS refresh_tokens_token_idx ON auth.refresh_tokens(token);
CREATE INDEX IF NOT EXISTS refresh_tokens_user_id_idx ON auth.refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON auth.sessions(user_id);
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON public.profiles(id);

-- Configure auth settings to disable email confirmation
INSERT INTO auth.config (name, value)
VALUES (
  'mailer',
  jsonb_build_object(
    'enable_confirmations', false,
    'mailer_autoconfirm', true,
    'enable_signup', true
  )
)
ON CONFLICT (name) 
DO UPDATE SET value = EXCLUDED.value;

-- Ensure all users are confirmed
UPDATE auth.users 
SET 
  confirmed_at = NOW(),
  email_confirmed_at = NOW()
WHERE 
  confirmed_at IS NULL 
  OR email_confirmed_at IS NULL;