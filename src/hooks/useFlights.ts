// Hook para buscar voos utilizando o Supabase e processar os resultados.
import { useState } from 'react';
import { BRAZILIAN_AIRPORTS } from '../lib/constants';
import { supabase } from '../lib/supabase';

interface Flight {
  id: string;
  price: {
    amount: number;
    currency: string;
  };
  segments: Array<{
    departure: {
      airport: {
        code: string;
        name: string;
      };
      time: string;
    };
    arrival: {
      airport: {
        code: string;
        name: string;
      };
      time: string;
    };
    duration: string;
    airline: {
      name: string;
      code: string;
    };
    flight_number: string;
  }>;
}

export function useFlights() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCityCode = (input: string): string => {
    const city = input.split(',')[0].trim();
    const code = BRAZILIAN_AIRPORTS[city];
    console.log('Converting city to IATA:', { city, code });
    if (!code) {
      console.warn(`No IATA code found for city: ${city}`);
    }
    return code || input;
  };

  const searchFlights = async (params: {
    departureCity: string;
    arrivalCity: string;
    date: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      console.log('Raw search parameters:', params);
      
      const departureCode = getCityCode(params.departureCity);
      const arrivalCode = getCityCode(params.arrivalCity);

      const { data, error: functionError } = await supabase.functions.invoke('search-flights', {
        body: {
          engine: 'google_flights',
          flight_type: 'round_trip',
          departure_id: departureCode,
          arrival_id: arrivalCode,
          outbound_date: params.date,
          return_date: '2025-06-04'
        },
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        }
      });

      console.log('Edge function response:', { data, error: functionError });

      if (functionError) {
        if (functionError.message.includes('not found')) {
          setError(`Não foram encontrados voos de ${params.departureCity} para ${params.arrivalCity}`);
        } else if (functionError.message.includes('invalid city')) {
          setError('Cidade inválida. Por favor, verifique os dados informados.');
        } else {
          setError(functionError.message || 'Erro ao buscar voos. Por favor, tente novamente.');
        }
        setFlights([]);
        return;
      }

      if (!data?.best_flights?.length) {
        setFlights([]);
        setError(`Não foram encontrados voos de ${params.departureCity} para ${params.arrivalCity}`);
        return;
      }

      const transformedFlights = data.best_flights.map((flight: any) => ({
        id: flight.departure_token || Math.random().toString(),
        price: {
          amount: flight.price || 0,
          currency: 'BRL'
        },
        segments: flight.flights.map((segment: any) => ({
          departure: {
            airport: {
              code: segment.departure_airport.id,
              name: segment.departure_airport.name
            },
            time: segment.departure_airport.time
          },
          arrival: {
            airport: {
              code: segment.arrival_airport.id,
              name: segment.arrival_airport.name
            },
            time: segment.arrival_airport.time
          },
          duration: `${segment.duration}min`,
          airline: {
            name: segment.airline,
            code: segment.flight_number.split(' ')[0]
          },
          flight_number: segment.flight_number
        }))
      }));

      console.log('Processed flights:', transformedFlights);
      setFlights(transformedFlights);
      
    } catch (error) {
      console.error('Flight search error:', error);
      let errorMessage = 'Ocorreu um erro ao buscar voos. Por favor, tente novamente.';
      
      if (error instanceof Error) {
        if (error.message.includes('network')) {
          errorMessage = 'Erro de conexão. Por favor, verifique sua internet e tente novamente.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'A busca demorou muito para responder. Por favor, tente novamente.';
        } else if (error.message.includes('401')) {
          errorMessage = 'Erro de autenticação. Por favor, tente novamente ou contate o suporte.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      setFlights([]);
    } finally {
      setLoading(false);
    }
  };

  return { flights, loading, error, searchFlights };
}