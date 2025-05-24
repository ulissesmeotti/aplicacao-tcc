import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTours } from '../hooks/useTours';
import { Star, Clock, Check, MapPin, Navigation } from 'lucide-react';
import toast from 'react-hot-toast';
import { differenceInDays } from 'date-fns';

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

export function Tours() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tours, loading, error, searchTours, nearbyPlaces } = useTours();
  const simulationData = location.state?.simulationData;
  const [selectedTours, setSelectedTours] = useState<Set<string>>(new Set());
  const [totalCost, setTotalCost] = useState(0);

  const numberOfDays = simulationData ? 
    differenceInDays(new Date(simulationData.endDate), new Date(simulationData.startDate)) : 0;

  const initializeTours = useCallback(async () => {
    if (!simulationData?.destination) {
      navigate('/simulation');
      return;
    }

    await searchTours(simulationData.destination);

    // Calculate initial total (flight + hotel)
    const flightCost = simulationData.selectedFlight?.price?.amount || 0;
    const hotelCostPerDay = simulationData.selectedHotel?.price?.amount || 0;
    const hotelTotal = hotelCostPerDay * numberOfDays;
    setTotalCost(flightCost + hotelTotal);
  }, [simulationData, navigate, searchTours, numberOfDays]);

  useEffect(() => {
    initializeTours();
  }, [initializeTours]);

  const handleTourSelect = (tour: Tour) => {
    setSelectedTours(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(tour.id)) {
        newSelected.delete(tour.id);
        setTotalCost(current => current - tour.price.amount);
      } else {
        newSelected.add(tour.id);
        setTotalCost(current => current + tour.price.amount);
      }
      return newSelected;
    });
    toast.success(
      selectedTours.has(tour.id) 
        ? 'Tour removido da sua simulação!'
        : 'Tour adicionado à sua simulação!'
    );
  };

  const handleViewSummary = () => {
    const selectedToursList = tours.filter(tour => selectedTours.has(tour.id));
    navigate('/summary', {
      state: {
        simulationData: {
          ...simulationData,
          selectedTours: selectedToursList,
          totalCost
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!simulationData) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-600">Nenhuma simulação encontrada. Por favor, inicie uma nova simulação.</p>
          <button
            onClick={() => navigate('/simulation')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Iniciar Simulação
          </button>
        </div>
      </div>
    );
  }

  const flightCost = simulationData.selectedFlight?.price?.amount || 0;
  const hotelCostPerDay = simulationData.selectedHotel?.price?.amount || 0;
  const hotelTotal = hotelCostPerDay * numberOfDays;
  const toursCost = totalCost - (flightCost + hotelTotal);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Passeios em {simulationData.destination}</h2>
          <p className="text-gray-600 mb-4">
            Explore as melhores experiências da região
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">Resumo dos Custos</h3>
            <div className="space-y-2">
              <p>Voo: R$ {flightCost.toFixed(2)}</p>
              <p>Hotel: R$ {hotelCostPerDay.toFixed(2)} x {numberOfDays} dias = R$ {hotelTotal.toFixed(2)}</p>
              <p>Tours Selecionados: R$ {toursCost.toFixed(2)}</p>
              <div className="border-t pt-2 mt-2">
                <p className="font-bold">Total: R$ {totalCost.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {nearbyPlaces.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Cidades Próximas</h3>
            <div className="flex flex-wrap gap-2">
              {nearbyPlaces.map((place) => (
                <div
                  key={place.geonameId}
                  className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center"
                >
                  <Navigation className="h-4 w-4 mr-1" />
                  {place.name}
                  <span className="text-blue-500 text-xs ml-1">
                    ({Math.round(place.population / 1000)}k hab.)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-6">
          {tours.map((tour) => {
            const isSelected = selectedTours.has(tour.id);
            return (
              <div
                key={tour.id}
                className={`border rounded-lg overflow-hidden transition-all ${
                  isSelected 
                    ? 'border-green-500 bg-green-50' 
                    : 'hover:shadow-lg border-gray-200'
                }`}
              >
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/3 bg-gray-100">
                    <div className="h-48 w-full relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-500/30" />
                      <div className="h-full w-full flex items-center justify-center text-gray-500">
                        {tour.category}
                      </div>
                    </div>
                  </div>
                  <div className="p-4 md:w-2/3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">{tour.name}</h3>
                        <p className="text-gray-600 text-sm mt-1">{tour.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">
                          R$ {tour.price.amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">por pessoa</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {tour.included.map((item, index) => (
                        <span
                          key={index}
                          className={`px-2 py-1 text-sm rounded-full transition-colors ${
                            isSelected
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700 group-hover:bg-gray-200'
                          }`}
                        >
                          {item}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center space-x-4">
                      <div className="flex items-center">
                        <Star className="h-5 w-5 text-yellow-400" />
                        <span className="ml-1">{tour.rating.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-gray-400" />
                        <span className="ml-1 text-gray-600">{tour.duration}</span>
                      </div>
                      <div className="flex items-center">
                        <Check className="h-5 w-5 text-green-500" />
                        <span className="ml-1 text-gray-600">{tour.booking_type}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-start space-x-2 text-sm text-gray-500">
                      <MapPin className="h-5 w-5 flex-shrink-0" />
                      <span>Ponto de encontro: {tour.meeting_point}</span>
                    </div>

                    <button
                      onClick={() => handleTourSelect(tour)}
                      className={`mt-4 w-full md:w-auto px-6 py-2 rounded-md transition-colors ${
                        isSelected
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isSelected ? 'Remover da Simulação' : 'Adicionar à Simulação'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View Summary Button */}
        <div className="mt-8">
          <button
            onClick={handleViewSummary}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Ver Resumo da Simulação
          </button>
        </div>
      </div>
    </div>
  );
}