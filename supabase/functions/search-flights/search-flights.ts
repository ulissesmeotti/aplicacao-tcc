import axios from 'axios';

const SEARCHAPI_URL = 'https://serpapi.com/search.json';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json'
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return new Response(
      JSON.stringify({ 
        error: 'Missing authorization header'
      }),
      { 
        status: 401,
        headers: corsHeaders
      }
    );
  }

  try {
    const url = new URL(req.url);
    const params = Object.fromEntries(url.searchParams);

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
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters',
          message: 'departure_id, arrival_id, and outbound_date are required',
          received: { departure_id, arrival_id, outbound_date }
        }),
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }

    if (departure_id.length !== 3 || arrival_id.length !== 3) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid airport codes',
          message: 'Airport codes must be 3 letters (e.g., GRU, GIG)',
          received: { departure_id, arrival_id }
        }),
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }

    const searchParams = {
      engine,
      flight_type,
      departure_id,
      arrival_id,
      outbound_date,
      currency,
      hl,
      api_key: Deno.env.get('SEARCHAPI_KEY')
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

    console.log('SearchAPI request params:', searchParams);

    const response = await axios.get(SEARCHAPI_URL, {
      params: searchParams,
      timeout: 30000
    });

    console.log('SearchAPI response status:', response.status);
    console.log('SearchAPI response data keys:', Object.keys(response.data || {}));

    if (!response.data) {
      return new Response(
        JSON.stringify({ 
          error: 'No data received from flight search API',
          message: 'The search API returned an empty response'
        }),
        { 
          status: 502,
          headers: corsHeaders
        }
      );
    }

    if (response.data.error) {
      return new Response(
        JSON.stringify({ 
          error: 'Flight search API error',
          message: response.data.error.message || 'Unknown API error',
          details: response.data.error
        }),
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }

    return new Response(
      JSON.stringify(response.data),
      { 
        status: 200,
        headers: corsHeaders
      }
    );
  } catch (error) {
    console.error('Search flights error:', error);

    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        return new Response(
          JSON.stringify({ 
            error: 'Request timeout',
            message: 'The flight search request timed out. Please try again.'
          }),
          { 
            status: 408,
            headers: corsHeaders
          }
        );
      }

      if (error.response?.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: 'Rate limit exceeded',
            message: 'Too many requests. Please try again later.'
          }),
          { 
            status: 429,
            headers: corsHeaders
          }
        );
      }
      
      if (error.response?.status === 401) {
        return new Response(
          JSON.stringify({ 
            error: 'Authentication failed',
            message: 'Invalid API key'
          }),
          { 
            status: 401,
            headers: corsHeaders
          }
        );
      }

      if (error.response?.status === 400) {
        return new Response(
          JSON.stringify({ 
            error: 'Bad request',
            message: error.response.data?.message || 'Invalid request parameters'
          }),
          { 
            status: 400,
            headers: corsHeaders
          }
        );
      }
    }

    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
});