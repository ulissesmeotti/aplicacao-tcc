// Hook para buscar tours baseados em um destino,
// consulta Geonames para obter o local principal e lugares próximos,
// gera tours fictícios com informações relevantes,

import { useCallback, useState } from 'react';
import { usePlaces } from './usePlaces';

interface Tour {
  id: string;
  name: string;
  description: string;
  price: {
    amount: number;
    currency: string;
  };
  rating: number;
  photo: string;
  duration: string;
  booking_type: string;
  included: string[];
  meeting_point: string;
  category: string;
}

interface GeoLocation {
  lat: number;
  lng: number;
}

interface GeoPlace {
  name: string;
  countryName: string;
  adminName1: string;
  lat: number;
  lng: number;
  population: number;
  toponymName: string;
  geonameId: number;
  fcl: string;
  fcode: string;
}

export function useTours() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<GeoPlace[]>([]);
  const { places, loading: placesLoading, error: placesError, searchPlaces } = usePlaces();

  const fetchNearbyPlaces = useCallback(async (location: GeoLocation) => {
    try {
      const response = await fetch(
        `https://secure.geonames.org/findNearbyPlaceNameJSON?` +
        `lat=${location.lat}&lng=${location.lng}` +
        `&radius=30&maxRows=20&cities=cities1000` +
        `&username=ulisses&style=FULL`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch nearby places');
      }

      const data = await response.json();
      return data.geonames || [];
    } catch (error) {
      console.error('Error fetching nearby places:', error);
      return [];
    }
  }, []);

  const generateTourFromPlace = useCallback((place: GeoPlace): Tour => {
    const categories = ['Histórico', 'Cultural', 'Natureza', 'Aventura', 'Gastronômico'];
    const durations = ['2-3 horas', '4-5 horas', 'Dia inteiro'];
    
    return {
      id: place.geonameId.toString(),
      name: `Tour em ${place.name}`,
      description: `Explore ${place.name}, uma das principais atrações da região de ${place.adminName1}. Conheça a cultura local, história e belezas naturais desta cidade encantadora.`,
      price: {
        amount: Math.floor(Math.random() * (300 - 50 + 1)) + 50,
        currency: 'BRL'
      },
      rating: (Math.random() * 2) + 3,
      photo: `https://source.unsplash.com/800x600/?${encodeURIComponent(place.name + ' brazil')}`,
      duration: durations[Math.floor(Math.random() * durations.length)],
      booking_type: 'Confirmação Instantânea',
      included: [
        'Guia profissional bilíngue',
        'Transporte com ar condicionado',
        'Ingressos para atrações',
        'Água mineral',
        'Seguro viagem'
      ],
      meeting_point: `Centro de ${place.name}`,
      category: categories[Math.floor(Math.random() * categories.length)]
    };
  }, []);

  const searchTours = useCallback(async (destination: string) => {
    if (!destination) return;
    
    setLoading(true);
    setError(null);

    try {
      const coords = destination.match(/lat: ([-\d.]+), lng: ([-\d.]+)/);
      
      if (!coords) {
        const searchResponse = await fetch(
          `https://secure.geonames.org/searchJSON?` +
          `q=${encodeURIComponent(destination.split(',')[0])}` +
          `&country=BR&maxRows=1&username=ulisses&style=FULL`
        );

        if (!searchResponse.ok) {
          throw new Error('Failed to find destination');
        }

        const searchData = await searchResponse.json();
        if (!searchData.geonames?.length) {
          throw new Error('Destination not found');
        }

        const mainPlace = searchData.geonames[0];
        const nearby = await fetchNearbyPlaces({
          lat: parseFloat(mainPlace.lat),
          lng: parseFloat(mainPlace.lng)
        });

        setNearbyPlaces(nearby);

        const allTours = [
          generateTourFromPlace(mainPlace),
          ...nearby
            .filter(place => place.geonameId !== mainPlace.geonameId)
            .map(generateTourFromPlace)
        ];

        setTours(allTours);
      } else {
        const lat = parseFloat(coords[1]);
        const lng = parseFloat(coords[2]);
        
        const nearby = await fetchNearbyPlaces({ lat, lng });
        setNearbyPlaces(nearby);
        
        const allTours = nearby.map(generateTourFromPlace);
        setTours(allTours);
      }

    } catch (err) {
      console.error('Error searching tours:', err);
      setError(err instanceof Error ? err.message : 'Failed to search tours');
    } finally {
      setLoading(false);
    }
  }, [fetchNearbyPlaces, generateTourFromPlace]);

  return {
    tours,
    loading: loading || placesLoading,
    error: error || placesError,
    searchTours,
    nearbyPlaces
  };
}