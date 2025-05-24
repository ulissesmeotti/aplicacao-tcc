/*
  # Add columns for selected flight and hotel

  1. Changes
    - Add `selected_flight` column to store flight details
    - Add `selected_hotel` column to store hotel details
    - Add `total_cost` column for the total cost of the simulation

  2. Notes
    - Using JSONB type to store structured data
    - Adding columns if they don't exist to make migration safe
*/

DO $$ 
BEGIN 
  -- Add selected_flight column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'simulations' 
    AND column_name = 'selected_flight'
  ) THEN
    ALTER TABLE simulations ADD COLUMN selected_flight JSONB DEFAULT NULL;
  END IF;

  -- Add selected_hotel column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'simulations' 
    AND column_name = 'selected_hotel'
  ) THEN
    ALTER TABLE simulations ADD COLUMN selected_hotel JSONB DEFAULT NULL;
  END IF;

  -- Add total_cost column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'simulations' 
    AND column_name = 'total_cost'
  ) THEN
    ALTER TABLE simulations ADD COLUMN total_cost NUMERIC(10,2) DEFAULT 0;
  END IF;
END $$;