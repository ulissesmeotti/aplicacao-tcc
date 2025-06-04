import axios from 'axios';
import { BRAZILIAN_AIRPORTS } from './constants';

class FlightsAPI {
  private getCityCode(cityName: string): string {
    const city = cityName.split(',')[0].trim();
    
    const code = BRAZILIAN_AIRPORTS[city];
    if (!code) {
      throw new Error(`Código de aeroporto não encontrado para ${city}`);
    }
    
    return code;
  }

  async searchFlights(params: {
    departureCity: string;
    arrivalCity: string;
    departureDate: string;
    adults?: number;
    children?: number;
  }) {
    try {
      if (!params.departureCity || !params.arrivalCity || !params.departureDate) {
        throw new Error('Parâmetros de busca incompletos');
      }

      const departureCode = this.getCityCode(params.departureCity);
      const arrivalCode = this.getCityCode(params.arrivalCity);

      console.log('Searching flights with params:', {
        departure: departureCode,
        arrival: arrivalCode,
        date: params.departureDate
      });

      const { data } = await axios.get(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/search-flights`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        
        
        params: {
          departureCity: departureCode,
          arrivalCity: arrivalCode,
          date: params.departureDate,
          adults: params.adults || 1,
          children: params.children || 0
        }
      });
      console.log(data);  
      if (!data?.flights?.length) {
        return [];
      }

      return data.flights;
    } catch (error) {
      console.error('Error searching flights:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
          throw new Error('Limite de requisições excedido. Por favor, tente novamente em alguns minutos.');
        }
        if (error.response?.status === 401) {
          throw new Error('Erro de autenticação com a API. Por favor, contate o suporte.');
        }
        if (error.response?.status === 400) {
          throw new Error('Parâmetros de busca inválidos. Por favor, verifique os dados informados.');
        }
        
        console.error('API Error Response:', error.response?.data);
      }
      
      if (error instanceof Error && error.message.includes('Código de aeroporto')) {
        throw error;
      }
      
      throw new Error('Não foi possível buscar voos no momento. Por favor, tente novamente mais tarde.');
    }
  }
}

export const flightsAPI = new FlightsAPI();