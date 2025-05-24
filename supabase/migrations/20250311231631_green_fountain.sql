/*
  # Initial Schema Setup for Travel Simulation System

  1. Tables
    - profiles (safe creation)
      - User profile information
      - Linked to auth.users
    - simulations (safe creation)
      - Stores travel simulation data
      - Includes destination, dates, and selections

  2. Security
    - Enable RLS on all tables
    - Add policies for user data access
*/

-- Safe creation of profiles table
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id),
    updated_at timestamptz DEFAULT now(),
    full_name text NOT NULL,
    avatar_url text
  );
EXCEPTION
  WHEN duplicate_table THEN
    NULL;
END $$;

-- Safe creation of simulations table
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS simulations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now(),
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    destination text NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    adults integer NOT NULL DEFAULT 1,
    children integer NOT NULL DEFAULT 0,
    selected_flight jsonb,
    selected_hotel jsonb,
    selected_activities jsonb[],
    total_cost decimal NOT NULL DEFAULT 0
  );
EXCEPTION
  WHEN duplicate_table THEN
    NULL;
END $$;

-- Enable RLS (safe operations)
DO $$ BEGIN
  ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS simulations ENABLE ROW LEVEL SECURITY;
END $$;

-- Create or replace policies for profiles
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
  CREATE POLICY "Users can view own profile"
    ON profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

  DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
  CREATE POLICY "Users can update own profile"
    ON profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);
END $$;

-- Create or replace policies for simulations
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own simulations" ON simulations;
  CREATE POLICY "Users can view own simulations"
    ON simulations
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users can create own simulations" ON simulations;
  CREATE POLICY "Users can create own simulations"
    ON simulations
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users can update own simulations" ON simulations;
  CREATE POLICY "Users can update own simulations"
    ON simulations
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users can delete own simulations" ON simulations;
  CREATE POLICY "Users can delete own simulations"
    ON simulations
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
END $$;

-- Create or replace function to handle new user profiles
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger (safely)
DO $$ BEGIN
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;