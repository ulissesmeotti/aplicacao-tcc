import axios from 'axios';

const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'hotels4.p.rapidapi.com';

class HotelsAPI {
  async searchHotels(params: {
    cityName: string;
    checkInDate: string;
    checkOutDate: string;
    adults: number;
    children?: number;
  }) {
    try {
      const locationResponse = await axios({
        method: 'GET',
        url: 'https://hotels4.p.rapidapi.com/locations/v3/search',
        params: {
          q: params.cityName,
          locale: 'pt_BR',
          langid: '1046',
          siteid: '300000001'
        },
        headers: {
          'X-RapidAPI-Host': RAPIDAPI_HOST,
          'X-RapidAPI-Key': RAPIDAPI_KEY
        }
      });

      const destination = locationResponse.data?.sr?.[0];
      if (!destination) {
        throw new Error(`Destino não encontrado: ${params.cityName}`);
      }

      const [checkInYear, checkInMonth, checkInDay] = params.checkInDate.split('-');
      const [checkOutYear, checkOutMonth, checkOutDay] = params.checkOutDate.split('-');

      const response = await axios({
        method: 'POST',
        url: 'https://hotels4.p.rapidapi.com/properties/v2/list',
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Host': RAPIDAPI_HOST,
          'X-RapidAPI-Key': RAPIDAPI_KEY
        },
        data: {
          currency: "BRL",
          eapid: 1,
          locale: "pt_BR",
          siteId: 300000001,
          destination: {
            regionId: destination.gaiaId
          },
          checkInDate: {
            day: parseInt(checkInDay),
            month: parseInt(checkInMonth),
            year: parseInt(checkInYear)
          },
          checkOutDate: {
            day: parseInt(checkOutDay),
            month: parseInt(checkOutMonth),
            year: parseInt(checkOutYear)
          },
          rooms: [
            {
              adults: params.adults,
              children: params.children ? [{ age: 7 }] : []
            }
          ],
          resultsStartingIndex: 0,
          resultsSize: 10,
          sort: "PRICE_LOW_TO_HIGH",
          filters: {
            price: {
              max: 5000,
              min: 100
            }
          }
        }
      });

      if (!response.data?.data?.propertySearch?.properties) {
        return { data: { propertySearch: { properties: [] } } };
      }

      return response.data;
    } catch (error) {
      console.error('Error searching hotels:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
          throw new Error('Limite de requisições excedido. Por favor, tente novamente em alguns minutos.');
        }
        throw new Error(error.response?.data?.message || 'Falha ao buscar hotéis');
      }
      throw error;
    }
  }
}

export const hotelsAPI = new HotelsAPI();