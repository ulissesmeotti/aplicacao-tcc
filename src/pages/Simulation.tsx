import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGeonames } from '../hooks/useGeonames';
import { useFlights } from '../hooks/useFlights';
import { useHotels } from '../hooks/useHotels';
import { Search, Plane, Hotel, Star, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export function Simulation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cities, loading: citiesLoading, searchCities } = useGeonames();
  const { flights, loading: flightsLoading, error: flightsError, searchFlights } = useFlights();
  const { hotels, loading: hotelsLoading, error: hotelsError, searchHotels } = useHotels();
  const [showCities, setShowCities] = useState(false);
  const [destination, setDestination] = useState(location.state?.destination || '');
  const [departureCity, setDepartureCity] = useState(location.state?.departureCity || '');
  const [showDepartureCities, setShowDepartureCities] = useState(false);
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [selectedDepartureCity, setSelectedDepartureCity] = useState<any>(null);
  const [startDate, setStartDate] = useState(location.state?.departureDate || '');
  const [endDate, setEndDate] = useState(location.state?.returnDate || '');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [selectedFlight, setSelectedFlight] = useState<any>(null);
  const [selectedHotel, setSelectedHotel] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const departureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowCities(false);
      }
      if (departureRef.current && !departureRef.current.contains(event.target as Node)) {
        setShowDepartureCities(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async () => {
    if (!selectedCity || !selectedDepartureCity || !startDate || !endDate) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    setShowResults(true);

    // Search for flights
    await searchFlights({
      departureCity: selectedDepartureCity.iata,
      arrivalCity: selectedCity.iata,
      date: startDate
    });

    // Search for hotels
    await searchHotels({
      cityName: selectedCity.name,
      checkIn: startDate,
      checkOut: endDate,
      adults,
      children
    });
  };

  const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDestination(value);
    setSelectedCity(null);
    setShowCities(true);
    if (value.length >= 2) {
      searchCities(value);
    }
  };

  const handleDepartureCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDepartureCity(value);
    setSelectedDepartureCity(null);
    setShowDepartureCities(true);
    if (value.length >= 2) {
      searchCities(value);
    }
  };

  const handleCitySelect = (city: any, isDeparture = false) => {
    const cityData = {
      name: city.name,
      country: city.countryName,
      lat: city.lat,
      lng: city.lng,
      iata: city.iata,
      adminName1: city.adminName1,
    };

    if (isDeparture) {
      setSelectedDepartureCity(cityData);
      setDepartureCity(`${city.name}, ${city.adminName1}`);
      setShowDepartureCities(false);
    } else {
      setSelectedCity(cityData);
      setDestination(`${city.name}, ${city.adminName1}`);
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
          destination: `${selectedCity.name}, ${selectedCity.adminName1}`,
          departureCity: `${selectedDepartureCity.name}, ${selectedDepartureCity.adminName1}`,
          startDate,
          endDate,
          adults,
          children,
          selectedFlight,
          selectedHotel,
          total: selectedFlight.price + selectedHotel.price_breakdown.gross_price
        }
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Simular Viagem no Brasil</h2>
        
        {/* Search Form */}
        <div className="space-y-4 mb-8">
          <div ref={departureRef} className="relative">
            <label htmlFor="departureCity" className="block text-sm font-medium text-gray-700 mb-1">
              Cidade de Origem
            </label>
            <div className="relative">
              <input
                type="text"
                id="departureCity"
                value={departureCity}
                onChange={handleDepartureCityChange}
                placeholder="Buscar cidade de origem..."
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-10"
                required
              />
              <Search className="absolute left-3 top-[50%] transform translate-y-[-50%] text-gray-400 h-5 w-5" />
            </div>
            {showDepartureCities && departureCity.length >= 2 && (
              <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200">
                {citiesLoading ? (
                  <div className="p-4 text-center text-gray-500">Carregando...</div>
                ) : cities.length > 0 ? (
                  <ul className="max-h-60 overflow-auto">
                    {cities.map((city, index) => (
                      <li
                        key={`${city.name}-${index}`}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleCitySelect(city, true)}
                      >
                        <div className="font-medium">{city.name}</div>
                        <div className="text-sm text-gray-500">{city.adminName1}</div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 text-center text-gray-500">Nenhuma cidade encontrada</div>
                )}
              </div>
            )}
          </div>

          <div ref={searchRef} className="relative">
            <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">
              Cidade de Destino
            </label>
            <div className="relative">
              <input
                type="text"
                id="destination"
                value={destination}
                onChange={handleDestinationChange}
                placeholder="Buscar cidade de destino..."
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-10"
                required
              />
              <Search className="absolute left-3 top-[50%] transform translate-y-[-50%] text-gray-400 h-5 w-5" />
            </div>
            {showCities && destination.length >= 2 && (
              <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200">
                {citiesLoading ? (
                  <div className="p-4 text-center text-gray-500">Carregando...</div>
                ) : cities.length > 0 ? (
                  <ul className="max-h-60 overflow-auto">
                    {cities.map((city, index) => (
                      <li
                        key={`${city.name}-${index}`}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleCitySelect(city)}
                      >
                        <div className="font-medium">{city.name}</div>
                        <div className="text-sm text-gray-500">{city.adminName1}</div>
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
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                Data de Volta
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || new Date().toISOString().split('T')[0]}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
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
                min="1"
                value={adults}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value) && value >= 1) {
                    setAdults(value);
                  }
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="children" className="block text-sm font-medium text-gray-700 mb-1">
                Crianças
              </label>
              <input
                type="number"
                id="children"
                min="0"
                value={children}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value) && value >= 0) {
                    setChildren(value);
                  }
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
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

        {/* Results Section */}
        {showResults && (
          <div className="space-y-8">
            {/* Flights Section */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Voos Disponíveis</h3>
              {flightsLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {flightsError && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                      <p className="text-yellow-700">{flightsError}</p>
                    </div>
                  )}
                  {flights.map((flight) => (
                    <div
                      key={flight.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedFlight?.id === flight.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => setSelectedFlight(flight)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Plane className="h-6 w-6 text-blue-500" />
                          <div>
                            <p className="font-medium">
                              {flight.airline.name} {flight.flight.number}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(flight.departure.scheduled).toLocaleTimeString()} -{' '}
                              {new Date(flight.arrival.scheduled).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-lg font-bold">R$ {flight.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Hotels Section */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Hotéis Disponíveis</h3>
              {hotelsLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {hotelsError && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                      <p className="text-yellow-700">{hotelsError}</p>
                    </div>
                  )}
                  {hotels.map((hotel) => (
                    <div
                      key={hotel.id}
                      onClick={() => setSelectedHotel(hotel)}
                      className={`group p-6 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
                        selectedHotel?.id === hotel.id
                          ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-[1.02]'
                          : 'border-gray-200 hover:border-blue-300 hover:shadow-md hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start space-x-6">
                        <div className="relative w-40 h-32 flex-shrink-0 overflow-hidden rounded-lg">
                          <img
                            src={hotel.main_photo_url}
                            alt={hotel.name}
                            className={`w-full h-full object-cover transition-transform duration-300 ${
                              selectedHotel?.id === hotel.id ? 'scale-110' : 'group-hover:scale-105'
                            }`}
                          />
                          <div className={`absolute inset-0 transition-opacity duration-300 ${
                            selectedHotel?.id === hotel.id
                              ? 'bg-blue-900/10'
                              : 'bg-black/0 group-hover:bg-black/5'
                          }`} />
                          {selectedHotel?.id === hotel.id && (
                            <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                              Selecionado
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className={`font-medium text-lg transition-colors ${
                                selectedHotel?.id === hotel.id ? 'text-blue-700' : 'text-gray-900'
                              }`}>
                                {hotel.name}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">{hotel.description}</p>
                              <p className="text-sm text-gray-500 mt-1">{hotel.address}</p>
                              <div className="flex items-center mt-2">
                                <Star className={`h-5 w-5 ${
                                  selectedHotel?.id === hotel.id ? 'text-blue-500' : 'text-yellow-400'
                                }`} />
                                <span className="ml-1 font-medium">{hotel.review_score.toFixed(1)}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-2xl font-bold ${
                                selectedHotel?.id === hotel.id ? 'text-blue-600' : 'text-gray-900'
                              }`}>
                                R$ {hotel.price_breakdown.gross_price}
                              </div>
                              <p className="text-sm text-gray-500">por noite</p>
                            </div>
                          </div>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {hotel.hotel_facilities.map((facility, i) => (
                              <span
                                key={i}
                                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                                  selectedHotel?.id === hotel.id
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-gray-100 text-gray-700 group-hover:bg-gray-200'
                                }`}
                              >
                                {facility}
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

            {/* Continue Button */}
            {(selectedFlight || selectedHotel) && (
              <button
                onClick={handleContinue}
                disabled={!selectedFlight || !selectedHotel}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuar para Atividades
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}