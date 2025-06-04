import axios from 'axios';

const SUPABASE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/search-flights`;

interface FlightSearchParams {
  departure_id: string;
  arrival_id: string;
  outbound_date: string;
  return_date?: string;
  adults?: string;
  children?: string;
  currency?: string;
  hl?: string;
  flight_type?: string;
  engine?: string;
}

export const searchFlights = async (params: FlightSearchParams) => {
  const { 
    engine = 'google_flights',
    flight_type = 'round_trip',
    departure_id,
    arrival_id,
    outbound_date,
    return_date,
    adults = '1',
    children = '0',
    currency = 'BRL',
    hl = 'en'
  } = params;

  if (!departure_id || !arrival_id || !outbound_date) {
    throw new Error('Missing required parameters: departure_id, arrival_id, and outbound_date are required');
  }

  if (departure_id.length !== 3 || arrival_id.length !== 3) {
    throw new Error('Invalid airport codes: Airport codes must be 3 letters (e.g., GRU, GIG)');
  }

  const searchParams = {
    engine,
    flight_type,
    departure_id,
    arrival_id,
    outbound_date,
    currency,
    hl
  };

  if (return_date) {
    searchParams.return_date = return_date;
  }

  if (adults && adults !== '1') {
    searchParams.adults = adults;
  }
  if (children && children !== '0') {
    searchParams.children = children;
  }

  console.log('Supabase function request params:', searchParams);

  try {
    const response = await axios.get(SUPABASE_FUNCTION_URL, {
      params: searchParams,
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    console.log('Supabase function response status:', response.status);
    console.log('Supabase function response data keys:', Object.keys(response.data || {}));

    if (!response.data) {
      throw new Error('No data received from flight search API');
    }

    if (response.data.error) {
      throw new Error(response.data.error.message || 'Unknown API error');
    }

    return response.data;
  } catch (error) {
    console.error('Search flights error:', error);

    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout: The flight search request timed out. Please try again.');
      }

      if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded: Too many requests. Please try again later.');
      }
      
      if (error.response?.status === 401) {
        throw new Error('Authentication failed: Invalid Supabase anonymous key');
      }

      if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Invalid request parameters');
      }
    }

    throw new Error(error instanceof Error ? error.message : 'Unknown error occurred');
  }
};