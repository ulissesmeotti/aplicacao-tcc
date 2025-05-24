/*
  # Fix Authentication Setup

  1. Changes
    - Ensure email confirmation is disabled
    - Set default values for auth settings
    - Update existing users to confirmed status
    
  2. Security
    - Maintains existing RLS policies
    - No impact on data security
*/

-- Ensure auth.config exists and has correct settings
INSERT INTO auth.config (name, value)
VALUES ('mailer', '{"enable_confirmations": false}'::jsonb)
ON CONFLICT (name) DO UPDATE
SET value = jsonb_set(
  COALESCE(auth.config.value, '{}'::jsonb),
  '{enable_confirmations}',
  'false'
);

-- Set default for new users to be confirmed
ALTER TABLE auth.users 
ALTER COLUMN confirmed_at 
SET DEFAULT NOW();

-- Update any existing unconfirmed users
UPDATE auth.users 
SET confirmed_at = NOW(),
    email_confirmed_at = NOW()
WHERE confirmed_at IS NULL 
   OR email_confirmed_at IS NULL;

-- Disable email confirmation checks
UPDATE auth.config
SET value = value || 
  jsonb_build_object(
    'mailer_autoconfirm', true,
    'enable_signup', true
  )
WHERE name = 'mailer';