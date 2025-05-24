import { createClient } from 'npm:@supabase/supabase-js@2.39.7'
import axios from 'npm:axios@1.6.7'

const SEARCHAPI_KEY = 'gpKyTTYqXuC4qS1cZpyY5odC'
const SEARCHAPI_URL = 'https://www.searchapi.io/api/v1/search'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Content-Type': 'application/json'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    })
  }

  const authHeader = req.headers.get('authorization')
  if (!authHeader) {
    return new Response(
      JSON.stringify({ 
        error: 'Missing authorization header'
      }),
      { 
        status: 401,
        headers: corsHeaders
      }
    )
  }

  try {
    const url = new URL(req.url);
    const params = Object.fromEntries(url.searchParams);
    
    let body = {};
    if (req.method === 'POST') {
      body = await req.json();
    }

    const { 
      engine = 'google_flights',
      flight_type = 'round_trip',
      departure_id,
      arrival_id,
      outbound_date,
      return_date = '2025-06-04'
    } = { ...params, ...body };

    console.log('Request parameters:', { 
      engine,
      flight_type,
      departure_id,
      arrival_id,
      outbound_date,
      return_date
    });

    if (!departure_id || !arrival_id) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters',
          details: { departure_id, arrival_id }
        }),
        { 
          status: 400,
          headers: corsHeaders
        }
      )
    }

    const response = await axios.get(SEARCHAPI_URL, {
      params: {
        engine,
        flight_type,
        departure_id,
        arrival_id,
        outbound_date,
        return_date,
        currency: 'BRL',
        api_key: SEARCHAPI_KEY
      }
    });

    console.log('SearchAPI response status:', response.status);

    return new Response(
      JSON.stringify(response.data),
      { 
        status: 200,
        headers: corsHeaders
      }
    )

  } catch (error) {
    console.error('Search flights error:', error);

    if (axios.isAxiosError(error)) {
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
        )
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
        )
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
    )
  }
})