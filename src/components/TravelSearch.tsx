import { Calendar, Search, Star } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useFlights } from '../hooks/useFlights';
import { useGeonames } from '../hooks/useGeonames';
import { useHotels } from '../hooks/useHotels';

const BRAZILIAN_AIRPORTS: { [key: string]: string } = {
  'São Paulo': 'GRU',
  'Rio de Janeiro': 'GIG',
  'Brasília': 'BSB',
  'Salvador': 'SSA',
  'Fortaleza': 'FOR',
  'Recife': 'REC',
  'Porto Alegre': 'POA',
  'Manaus': 'MAO',
  'Belém': 'BEL',
  'Curitiba': 'CWB',
  'Florianópolis': 'FLN',
  'Natal': 'NAT',
  'Vitória': 'VIX',
  'Cuiabá': 'CGB',
  'Campo Grande': 'CGR',
  'João Pessoa': 'JPA',
  'Maceió': 'MCZ',
  'Goiânia': 'GYN',
};

export function TravelSearch() {
  const navigate = useNavigate();
  const { cities, loading: citiesLoading, searchCities } = useGeonames();
  const { flights, loading: flightsLoading, error: flightsError, searchFlights } = useFlights();
  const { hotels, loading: hotelsLoading, error: hotelsError, searchHotels } = useHotels();
  const [showCities, setShowCities] = useState(false);
  const [showDepartureCities, setShowDepartureCities] = useState(false);
  const [formData, setFormData] = useState({
    departure: '',
    destination: '',
    startDate: '',
    endDate: '',
    adults: 1,
    children: 0
  });
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [selectedDepartureCity, setSelectedDepartureCity] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<any>(null);
  const [selectedHotel, setSelectedHotel] = useState<any>(null);

  const getCityAirportCode = (cityName: string): string => {
    const city = cityName.split(',')[0].trim();
    return BRAZILIAN_AIRPORTS[city] || '';
  };

  const handleSearch = async () => {
    if (!selectedCity || !selectedDepartureCity || !formData.startDate || !formData.endDate) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    const departureCode = getCityAirportCode(selectedDepartureCity.name);
    const arrivalCode = getCityAirportCode(selectedCity.name);

    if (!departureCode || !arrivalCode) {
      toast.error('Aeroporto não encontrado para uma das cidades selecionadas');
      return;
    }

    setShowResults(true);

    try {
      await searchFlights({
        departureCity: departureCode,
        arrivalCity: arrivalCode,
        date: formData.startDate,
        adults: formData.adults,
        children: formData.children
      });

      await searchHotels({
        cityName: selectedCity.name,
        checkInDate: formData.startDate,
        checkOutDate: formData.endDate,
        adults: formData.adults,
        children: formData.children
      });
    } catch (error) {
      console.error('Error during search:', error);
      toast.error('Ocorreu um erro ao buscar opções de viagem');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'destination') {
      setSelectedCity(null);
      setShowCities(true);
      setShowDepartureCities(false);
      if (value.length >= 2) {
        searchCities(value);
      }
    } else if (name === 'departure') {
      setSelectedDepartureCity(null);
      setShowDepartureCities(true);
      setShowCities(false);
      if (value.length >= 2) {
        searchCities(value);
      }
    }
  };

  const handleCitySelect = (city: any, isDeparture: boolean) => {
    if (isDeparture) {
      setSelectedDepartureCity(city);
      setFormData(prev => ({ ...prev, departure: `${city.name}, ${city.adminName1}` }));
      setShowDepartureCities(false);
    } else {
      setSelectedCity(city);
      setFormData(prev => ({ ...prev, destination: `${city.name}, ${city.adminName1}` }));
      setShowCities(false);
    }
  };

  const handleContinue = () => {
    if (!selectedFlight || !selectedHotel) {
      toast.error('Por favor, selecione um voo e um hotel');
      return;
    }

    navigate('/tours', {
      state: {
        simulationData: {
          departure: `${selectedDepartureCity.name}, ${selectedDepartureCity.adminName1}`,
          destination: `${selectedCity.name}, ${selectedCity.adminName1}`,
          startDate: formData.startDate,
          endDate: formData.endDate,
          adults: formData.adults,
          children: formData.children,
          selectedFlight,
          selectedHotel,
          total: selectedFlight.price.amount + selectedHotel.price.amount
        }
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="space-y-4">
          <div className="relative">
            <label htmlFor="departure" className="block text-sm font-medium text-gray-700 mb-1">
              Cidade de Origem
            </label>
            <div className="relative">
              <input
                type="text"
                id="departure"
                name="departure"
                value={formData.departure}
                onChange={handleInputChange}
                placeholder="De onde você está saindo?"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <Search className="absolute left-3 top-[50%] transform -translate-y-[-50%] text-gray-400 h-5 w-5 mt-[-20px]" />
            </div>
            {showDepartureCities && formData.departure.length >= 2 && (
              <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg">
                {citiesLoading ? (
                  <div className="p-4 text-center text-gray-500">Carregando...</div>
                ) : cities.length > 0 ? (
                  <ul className="max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                    {cities.map((city) => (
                      <li
                        key={`${city.name}-${city.adminName1}`}
                        className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50"
                        onClick={() => handleCitySelect(city, true)}
                      >
                        <div className="flex items-center">
                          <span className="ml-3 block font-medium truncate">
                            {city.name}, {city.adminName1}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 text-center text-gray-500">Nenhuma cidade encontrada</div>
                )}
              </div>
            )}
          </div>

          <div className="relative">
            <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">
              Cidade de Destino
            </label>
            <div className="relative">
              <input
                type="text"
                id="destination"
                name="destination"
                value={formData.destination}
                onChange={handleInputChange}
                placeholder="Para onde você quer ir?"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <Search className="absolute left-3 top-[50%] transform -translate-y-[-50%] text-gray-400 h-5 w-5 mt-[-20px]" />
            </div>
            {showCities && formData.destination.length >= 2 && (
              <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg">
                {citiesLoading ? (
                  <div className="p-4 text-center text-gray-500">Carregando...</div>
                ) : cities.length > 0 ? (
                  <ul className="max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                    {cities.map((city) => (
                      <li
                        key={`${city.name}-${city.adminName1}`}
                        className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50"
                        onClick={() => handleCitySelect(city, false)}
                      >
                        <div className="flex items-center">
                          <span className="ml-3 block font-medium truncate">
                            {city.name}, {city.adminName1}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 text-center text-gray-500">Nenhuma cidade encontrada</div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Data de Ida
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <Calendar className="absolute left-3 top-[50%] transform -translate-y-[-50%] mt-[-20px] text-gray-400 h-5 w-5"/>
              </div>
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                Data de Volta
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <Calendar className="absolute left-3 top-[50%] mt-[-20px] transform -translate-y-[-50%] text-gray-400 h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="adults" className="block text-sm font-medium text-gray-700 mb-1">
                Adultos
              </label>
              <input
                type="number"
                id="adults"
                name="adults"
                min="1"
                value={formData.adults}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="children" className="block text-sm font-medium text-gray-700 mb-1">
                Crianças
              </label>
              <input
                type="number"
                id="children"
                name="children"
                min="0"
                value={formData.children}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            onClick={handleSearch}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Buscar Opções
          </button>
        </div>

        {showResults && (
          <div className="mt-8 space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Voos Disponíveis</h3>
              {flightsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : flightsError ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700">
                  {flightsError}
                </div>
              ) : flights.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700">
                  Não encontramos voos disponíveis para os critérios selecionados. Tente ajustar suas datas ou escolher outro destino.
                </div>
              ) : (
                <div className="space-y-4">
                  {flights.map((flight) => (
                    <div
                      key={flight.id}
                      onClick={() => setSelectedFlight(flight)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedFlight?.id === flight.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {flight.segments[0].airline.name} {flight.segments[0].flight_number}
                          </p>
                          <p className="text-sm text-gray-500">
                            {flight.segments[0].departure.time} - {flight.segments[0].arrival.time}
                          </p>
                          <p className="text-sm text-gray-500">
                            {flight.segments[0].duration}
                          </p>
                        </div>
                        <div className="text-lg font-bold">
                          R$ {flight.price.amount.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Hotéis Disponíveis</h3>
              {hotelsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : hotelsError ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700">
                  {hotelsError}
                </div>
              ) : hotels.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700">
                  Não encontramos hotéis disponíveis para os critérios selecionados. Tente ajustar suas datas ou escolher outro destino.
                </div>
              ) : (
                <div className="space-y-4">
                  {hotels.map((hotel) => (
                    <div
                      key={hotel.id}
                      onClick={() => setSelectedHotel(hotel)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedHotel?.id === hotel.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex">
                        <img
                          src={hotel.images[0]}
                          alt={hotel.name}
                          className="w-32 h-24 object-cover rounded-lg"
                        />
                        <div className="ml-4 flex-1">
                          <div className="flex justify-between">
                            <div>
                              <h4 className="font-medium">{hotel.name}</h4>
                              <p className="text-sm text-gray-500">{hotel.description}</p>
                              <div className="flex items-center mt-2">
                                <Star className="h-4 w-4 text-yellow-400" />
                                <span className="ml-1 text-sm">{hotel.rating}</span>
                              </div>
                            </div>
                            <div className="text-lg font-bold">
                              R$ {hotel.price.amount.toFixed(2)}
                            </div>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {hotel.amenities.map((amenity, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                              >
                                {amenity}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleContinue}
              disabled={!selectedFlight || !selectedHotel}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continuar para Atividades
            </button>
          </div>
        )}
      </div>
    </div>
  );
}