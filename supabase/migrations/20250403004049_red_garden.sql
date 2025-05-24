/*
  # Disable Email Confirmation Requirements

  1. Changes
    - Update existing users to confirmed status
    - Set email_confirmed_at for unconfirmed users
    - Ensure new users are automatically confirmed
    
  2. Security
    - Maintains existing RLS policies
    - No impact on data security
*/

-- Update any existing unconfirmed users
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- Set all existing users as confirmed
UPDATE auth.users 
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW());

-- Create or replace function to auto-confirm new users
CREATE OR REPLACE FUNCTION auth.handle_new_user()
RETURNS trigger AS $$
BEGIN
  NEW.email_confirmed_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for auto-confirmation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auth.handle_new_user();