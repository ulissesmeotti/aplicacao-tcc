-- Create simulations table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.simulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  destination text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  adults integer NOT NULL DEFAULT 1,
  children integer NOT NULL DEFAULT 0,
  selected_flight jsonb,
  selected_hotel jsonb,
  selected_activities jsonb[],
  total_cost decimal NOT NULL DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Enable RLS on simulations
ALTER TABLE public.simulations ENABLE ROW LEVEL SECURITY;

-- Create policy for public access to simulations
CREATE POLICY "Public can access simulations"
  ON public.simulations
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS simulations_destination_idx ON public.simulations(destination);
CREATE INDEX IF NOT EXISTS simulations_dates_idx ON public.simulations(start_date, end_date);