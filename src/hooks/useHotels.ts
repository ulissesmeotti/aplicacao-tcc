// Hook para buscar hotéis com base em parâmetros de localização, datas e ocupação.
import { useState } from 'react';
import { hotelsAPI } from '../lib/hotels';

interface Hotel {
  id: string;
  name: string;
  rating: number;
  price: {
    amount: number;
    currency: string;
  };
  address: string;
  description: string;
  amenities: string[];
  images: string[];
}

const DEFAULT_HOTEL_IMAGE = 'icone-hotel.jpg';

export function useHotels() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchHotels = async (params: {
    cityName: string;
    checkInDate: string;
    checkOutDate: string;
    adults: number;
    children?: number;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await hotelsAPI.searchHotels(params);
      
      if (!response.data?.propertySearch?.properties?.length) {
        setHotels([]);
        setError(`Não encontramos hotéis em ${params.cityName} para as datas selecionadas. Tente ajustar suas datas de viagem ou escolher um destino diferente.`);
        return;
      }

      const transformedHotels = response.data.propertySearch.properties
        .slice(0, 6)
        .map((hotel: any) => ({
          id: hotel.id,
          name: hotel.name,
          rating: parseFloat(hotel.reviews?.score || '0'),
          price: {
            amount: parseFloat(hotel.price?.lead?.amount || '0'),
            currency: 'R$'
          },
          address: hotel.location?.address?.addressLine || '',
          description: hotel.summary?.location || '',
          amenities: (hotel.amenities || []).slice(0, 5).map((a: any) => a.name),
          images: hotel.propertyGallery?.images?.length > 0 
            ? hotel.propertyGallery.images.map((img: any) => img.image.url)
            : [DEFAULT_HOTEL_IMAGE]
        }));

      setHotels(transformedHotels);
      setError(null);
    } catch (error) {
      console.error('Error searching hotels:', error);
      setError(
        'Ocorreu um erro ao buscar hotéis. Por favor, verifique sua conexão e tente novamente.'
      );
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  return { hotels, loading, error, searchHotels };
}