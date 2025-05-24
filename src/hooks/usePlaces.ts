// hook customizado para buscar lugares próximos a uma localização específica usando a API do Google Places
import { Loader } from '@googlemaps/js-api-loader';
import { useState } from 'react';

interface Place {
  id: string;
  name: string;
  type: string;
  rating: number;
  user_ratings_total: number;
  vicinity: string;
  photo_url?: string;
  price_level?: number;
  opening_hours?: {
    open_now: boolean;
  };
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

const GOOGLE_MAPS_API_KEY = 'AIzaSyA3Z_yADftXJjxe0SypUruFcCkuuW2D6zY';

const loader = new Loader({
  apiKey: GOOGLE_MAPS_API_KEY,
  version: 'weekly',
  libraries: ['places']
});

export function usePlaces() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchPlaces = async (params: {
    latitude: number;
    longitude: number;
    type: 'restaurant' | 'tourist_attraction' | 'museum' | 'park';
    radius?: number;
  }) => {
    setLoading(true);
    setError(null);

    try {
      await loader.load();
      const { latitude, longitude, type, radius = 5000 } = params;

      const service = new google.maps.places.PlacesService(
        document.createElement('div')
      );

      const request = {
        location: new google.maps.LatLng(latitude, longitude),
        radius,
        type: [type]
      };

      const results = await new Promise<google.maps.places.PlaceResult[]>((resolve, reject) => {
        service.nearbySearch(request, (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            resolve(results);
          } else {
            reject(new Error('Falha ao buscar lugares'));
          }
        });
      });

      const transformedPlaces: Place[] = results.map(place => ({
        id: place.place_id || '',
        name: place.name || '',
        type: place.types?.[0] || '',
        rating: place.rating || 0,
        user_ratings_total: place.user_ratings_total || 0,
        vicinity: place.vicinity || '',
        photo_url: place.photos?.[0]?.getUrl(),
        price_level: place.price_level,
        opening_hours: place.opening_hours,
        geometry: {
          location: {
            lat: place.geometry?.location?.lat() || 0,
            lng: place.geometry?.location?.lng() || 0
          }
        }
      }));

      setPlaces(transformedPlaces);
    } catch (err) {
      console.error('Erro ao buscar lugares:', err);
      setError(err instanceof Error ? err.message : 'Falha ao buscar lugares');
    } finally {
      setLoading(false);
    }
  };

  return { places, loading, error, searchPlaces };
}