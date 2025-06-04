import { useState } from 'react';
import { searchFlights } from '../../supabase/functions/search-flights/index';

export function useFlights() {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchFlightsHook = async (params) => {
    setLoading(true);
    setError(null);
    
    try {
      const searchParams = {
        departure_id: params.departureCity,
        arrival_id: params.arrivalCity,
        outbound_date: params.date,
        return_date: params.returnDate || calculateReturnDate(params.date),
        adults: params.adults?.toString() || '1',
        children: params.children?.toString() || '0',
        currency: 'BRL',
        hl: 'en'
      };

      const data = await searchFlights(searchParams);
      const transformedFlights = transformFlightsData(data);
      setFlights(transformedFlights);
    } catch (err) {
      console.error('Flight search error:', err);
      setError(err.message);
      setFlights([]);
    } finally {
      setLoading(false);
    }
  };

  return { flights, loading, error, searchFlights: searchFlightsHook };
}

function calculateReturnDate(outboundDate) {
  const date = new Date(outboundDate);
  date.setDate(date.getDate() + 7);
  return date.toISOString().split('T')[0];
}

function transformFlightsData(apiResponse) {
  console.log('SearchAPI response:', JSON.stringify(apiResponse, null, 2));
  if (!apiResponse.best_flights) {
    console.warn('No best_flights in response:', apiResponse);
    return [];
  }

  return apiResponse.best_flights.map((flight, index) => ({
    id: flight.flight_id || index,
    segments: flight.flights?.map(segment => ({
      airline: {
        name: segment.airline || 'Unknown Airline'
      },
      flight_number: segment.flight_number || 'N/A',
      departure: {
        time: segment.departure_airport?.time || 'N/A'
      },
      arrival: {
        time: segment.arrival_airport?.time || 'N/A'
      },
      duration: segment.duration || 'N/A'
    })) || [],
    price: {
      amount: flight.price || 0
    }
  }));
}