import { useLocation, useNavigate } from 'react-router-dom';
import { Plane, Hotel, MapPin, Calendar, Users } from 'lucide-react';
import { differenceInDays, format, isValid } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export function Summary() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const simulationData = location.state?.simulationData;

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

  const startDate = new Date(simulationData.start_date || simulationData.startDate);
  const endDate = new Date(simulationData.end_date || simulationData.endDate);

  // Check if dates are valid
  if (!isValid(startDate) || !isValid(endDate)) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Datas inválidas na simulação. Por favor, inicie uma nova simulação com datas válidas.</p>
          <button
            onClick={() => navigate('/simulation')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Iniciar Nova Simulação
          </button>
        </div>
      </div>
    );
  }

  const numberOfDays = differenceInDays(endDate, startDate);
  const hotelCostPerDay = simulationData.selected_hotel?.price?.amount || simulationData.selectedHotel?.price?.amount || 0;
  const hotelTotal = hotelCostPerDay * numberOfDays;
  const flightCost = simulationData.selected_flight?.price?.amount || simulationData.selectedFlight?.price?.amount || 0;
  const toursTotal = (simulationData.selected_activities || simulationData.selectedTours || [])
    .reduce((acc: number, tour: any) => acc + (tour.price?.amount || 0), 0);
  const finalTotal = flightCost + hotelTotal + toursTotal;

  const handleSaveSimulation = async () => {
    try {
      const { error } = await supabase.from('simulations').insert({
        user_id: user?.id,
        destination: simulationData.destination,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        adults: simulationData.adults || 1,
        children: simulationData.children || 0,
        selected_flight: {
          ...simulationData.selected_flight || simulationData.selectedFlight,
          price: {
            amount: flightCost,
            currency: 'BRL'
          }
        },
        selected_hotel: {
          ...simulationData.selected_hotel || simulationData.selectedHotel,
          price: {
            amount: hotelCostPerDay,
            currency: 'BRL'
          }
        },
        selected_activities: simulationData.selected_activities || simulationData.selectedTours || [],
        total_cost: finalTotal,
        metadata: {
          created_at: new Date().toISOString(),
          status: 'saved'
        }
      });

      if (error) throw error;

      toast.success('Simulação salva com sucesso!');
      navigate('/profile');
    } catch (error) {
      console.error('Error saving simulation:', error);
      toast.error('Erro ao salvar simulação');
    }
  };

  const getFlightInfo = (flight: any) => {
    if (!flight) return null;
    
    const flightData = flight.segments?.[0] || flight;
    return {
      airline: flightData.airline?.name || 'Companhia não especificada',
      departure: flightData.departure?.time || '--:--',
      arrival: flightData.arrival?.time || '--:--',
      duration: flightData.duration || 'Duração não especificada'
    };
  };

  const flight = getFlightInfo(simulationData.selected_flight || simulationData.selectedFlight);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Resumo da Simulação</h2>

        <div className="space-y-6">
          {/* Trip Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Detalhes da Viagem</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Origem</p>
                  <p className="font-medium">{simulationData.departure || 'Não especificado'}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Destino</p>
                  <p className="font-medium">{simulationData.destination}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Data de Ida</p>
                  <p className="font-medium">
                    {format(startDate, 'dd/MM/yyyy')}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Data de Volta</p>
                  <p className="font-medium">
                    {format(endDate, 'dd/MM/yyyy')}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Users className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Viajantes</p>
                  <p className="font-medium">
                    {simulationData.adults} {simulationData.adults === 1 ? 'adulto' : 'adultos'}
                    {simulationData.children > 0 && `, ${simulationData.children} ${simulationData.children === 1 ? 'criança' : 'crianças'}`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Flight Details */}
          {flight && (
            <div className="border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-4">
                <Plane className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Voo Selecionado</h3>
              </div>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">{flight.airline}</span>
                </p>
                <p className="text-gray-600">
                  {flight.departure} - {flight.arrival} ({flight.duration})
                </p>
                <p className="text-lg font-bold text-blue-600">
                  R$ {flightCost.toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {/* Hotel Details */}
          {(simulationData.selected_hotel || simulationData.selectedHotel) && (
            <div className="border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-4">
                <Hotel className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Hotel Selecionado</h3>
              </div>
              <div className="flex items-start space-x-4">
                <img
                  src={
                    simulationData.selected_hotel?.images?.[0] ||
                    simulationData.selected_hotel?.image ||
                    simulationData.selectedHotel?.images?.[0] ||
                    simulationData.selectedHotel?.image ||
                    'https://images.unsplash.com/photo-1566073771259-6a8506099945'
                  }
                  alt={(simulationData.selected_hotel || simulationData.selectedHotel)?.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div>
                  <p className="font-medium">
                    {(simulationData.selected_hotel || simulationData.selectedHotel)?.name}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {(simulationData.selected_hotel || simulationData.selectedHotel)?.description}
                  </p>
                  <p className="text-lg font-bold text-blue-600 mt-2">
                    R$ {hotelCostPerDay.toFixed(2)} x {numberOfDays} dias = R$ {hotelTotal.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Selected Tours */}
          {(simulationData.selected_activities?.length > 0 || simulationData.selectedTours?.length > 0) && (
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Tours Selecionados</h3>
              <div className="space-y-4">
                {(simulationData.selected_activities || simulationData.selectedTours).map((tour: any) => (
                  <div key={tour.id} className="flex items-start space-x-4">
                    <img
                      src={tour.photo}
                      alt={tour.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div>
                      <p className="font-medium">{tour.name}</p>
                      <p className="text-sm text-gray-600">{tour.duration}</p>
                      <p className="font-bold text-blue-600">R$ {tour.price.amount.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Total Cost */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Resumo dos Custos</h3>
            <div className="space-y-2">
              {flightCost > 0 && (
                <div className="flex justify-between">
                  <span>Voo</span>
                  <span>R$ {flightCost.toFixed(2)}</span>
                </div>
              )}
              {hotelTotal > 0 && (
                <div className="flex justify-between">
                  <span>Hotel ({numberOfDays} dias)</span>
                  <span>R$ {hotelTotal.toFixed(2)}</span>
                </div>
              )}
              {toursTotal > 0 && (
                <div className="flex justify-between">
                  <span>Tours</span>
                  <span>R$ {toursTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>R$ {finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveSimulation}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Salvar Simulação
          </button>
        </div>
      </div>
    </div>
  );
}