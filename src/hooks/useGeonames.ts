// Hook para buscar e gerenciar informações de cidades brasileiras usando a API GeoNames.
import axios from 'axios';
import { useState } from 'react';
import { BRAZILIAN_AIRPORTS } from '../lib/constants';

interface GeoCity {
  toponymName: string;
  name: string;
  countryName: string;
  population: number;
  lat: string;
  lng: string;
  adminName1: string;
  geonameId: number;
  iata?: string;
}

export function useGeonames() {
  const [cities, setCities] = useState<GeoCity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchCities = async (query: string) => {
    if (query.length < 2) {
      setCities([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('https://secure.geonames.org/searchJSON', {
        params: {
          q: query,
          country: 'BR',
          maxRows: 10,
          username: 'ulisses',
          featureClass: 'P',
          style: 'FULL',
          orderby: 'population',
          cities: 'cities15000'
        }
      });

      if (response.data.status?.message) {
        throw new Error(response.data.status.message);
      }

      const majorCities = response.data.geonames
        .filter((city: GeoCity) => city.population > 15000)
        .map((city: GeoCity) => ({
          ...city,
          iata: BRAZILIAN_AIRPORTS[city.name]
        }))
        .sort((a: GeoCity, b: GeoCity) => b.population - a.population);

      console.log('Cities with IATA codes:', majorCities);
      setCities(majorCities);
    } catch (err) {
      console.error('Error fetching cities:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setCities([]);
    } finally {
      setLoading(false);
    }
  };

  return { cities, loading, error, searchCities };
}