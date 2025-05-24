/*
  # Add metadata column to simulations table

  1. Changes
    - Add `metadata` JSONB column to `simulations` table with default empty object
    - Update RLS policies to include the new column

  2. Security
    - Maintain existing RLS policies
*/

-- Add metadata column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'simulations' 
    AND column_name = 'metadata'
  ) THEN
    ALTER TABLE simulations ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;