import { format } from 'date-fns';
import { Calendar, LogOut, MapPin, Trash2, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

interface Simulation {
  id: string;
  destination: string;
  start_date: string;
  end_date: string;
  total_cost: number;
  selected_hotel: any;
  selected_flight: any;
}

export function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [deletingSimulation, setDeletingSimulation] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadSimulations();
    }
  }, [user]);

  async function loadSimulations() {
    try {
      const { data, error } = await supabase
        .from('simulations')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSimulations(data || []);
    } catch (error) {
      console.error('Error loading simulations:', error);
      toast.error('Erro ao carregar simulações');
    }
  }

  async function deleteSimulation(simulationId: string) {
    try {
      setDeletingSimulation(simulationId);
      const { error } = await supabase
        .from('simulations')
        .delete()
        .eq('id', simulationId);

      if (error) throw error;

      toast.success('Simulação excluída com sucesso!');
      setSimulations(simulations.filter(sim => sim.id !== simulationId));
    } catch (error) {
      console.error('Error deleting simulation:', error);
      toast.error('Erro ao excluir simulação');
    } finally {
      setDeletingSimulation(null);
    }
  }

  async function updatePassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (passwords.new !== passwords.confirm) {
      toast.error('As senhas não coincidem');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.new,
      });

      if (error) throw error;

      toast.success('Senha atualizada com sucesso!');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Erro ao atualizar senha');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/');
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Erro ao fazer logout');
    }
  }

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'trips', label: 'Minhas Viagens', icon: MapPin },
  ];

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy');
    } catch (error) {
      return 'Data inválida';
    }
  };

  const getFlightInfo = (flight: any) => {
    if (!flight) return 'N/A';

    if (flight.segments && flight.segments[0]) {
      return flight.segments[0].airline.name;
    }

    if (flight.airline && flight.airline.name) {
      return flight.airline.name;
    }

    return 'N/A';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Minha Conta</h2>
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Sair
              </button>
            </div>
          </div>

          <div className="grid grid-cols-12 min-h-[600px]">
            <div className="col-span-12 md:col-span-3 border-r border-gray-200">
              <nav className="p-4 space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                    >
                      <Icon className="h-5 w-5 mr-2" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="col-span-12 md:col-span-9 p-6">
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={user?.email}
                      disabled
                      className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
                    />
                  </div>


                </div>
              )}

              {activeTab === 'trips' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">
                      Minhas Simulações de Viagem
                    </h3>
                    <button
                      onClick={() => navigate('/simulation')}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Nova Simulação
                    </button>
                  </div>

                  <div className="space-y-4">
                    {simulations.map((simulation) => (
                      <div
                        key={simulation.id}
                        className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="p-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-lg font-medium text-gray-900">
                                {simulation.destination}
                              </h4>
                              <div className="mt-2 flex items-center text-sm text-gray-500">
                                <Calendar className="h-4 w-4 mr-1" />
                                {formatDate(simulation.start_date)} -{' '}
                                {formatDate(simulation.end_date)}
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <p className="text-lg font-bold text-blue-600">
                                  R$ {simulation.total_cost.toFixed(2)}
                                </p>
                              </div>
                              <button
                                onClick={() => deleteSimulation(simulation.id)}
                                disabled={deletingSimulation === simulation.id}
                                className="text-red-600 hover:text-red-700 focus:outline-none"
                                title="Excluir simulação"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-3 rounded-md">
                              <p className="text-sm font-medium text-gray-900">Voo</p>
                              <p className="text-sm text-gray-500">
                                {getFlightInfo(simulation.selected_flight)}
                              </p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-md">
                              <p className="text-sm font-medium text-gray-900">Hotel</p>
                              <p className="text-sm text-gray-500">
                                {simulation.selected_hotel?.name || 'N/A'}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => navigate(`/summary`, { state: { simulationData: simulation } })}
                            className="mt-4 w-full md:w-auto px-6 py-2 text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Ver Detalhes
                          </button>
                        </div>
                      </div>
                    ))}

                    {simulations.length === 0 && (
                      <div className="text-center py-12">
                        <MapPin className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                          Nenhuma simulação encontrada
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Comece criando uma nova simulação de viagem.
                        </p>
                        <div className="mt-6">
                          <button
                            onClick={() => navigate('/simulation')}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Nova Simulação
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}