import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { TravelSearch } from '../components/TravelSearch';
import { PopularDestinations } from '../components/PopularDestinations';
import { Plane, Hotel, Map, LogIn } from 'lucide-react';
import { LoginModal } from '../components/LoginModal';

export function Home() {
  const { user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSearchForm, setShowSearchForm] = useState(false);

  const handleStartSimulation = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    setShowSearchForm(true);
  };

  return (
    <div>
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-16 px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Planeje a viagem dos seus sonhos</span>
            <span className="block text-blue-600">Com confiança</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Simule sua viagem perfeita com preços em tempo real para hotéis e atividades.
            Tome decisões informadas e crie memórias inesquecíveis.
          </p>

          <div className="mt-10">
            {!showSearchForm ? (
              <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-8">
                  <h2 className="text-2xl font-bold mb-4">Faça login para simular sua viagem</h2>
                  <p className="text-gray-600 mb-6">
                    Para acessar todas as funcionalidades e simular sua viagem dos sonhos, faça login ou crie uma conta.
                  </p>
                  <button
                    onClick={handleStartSimulation}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <LogIn className="mr-2 h-5 w-5" />
                    {user ? 'Começar Simulação' : 'Fazer Login'}
                  </button>
                </div>
              </div>
            ) : (
              <TravelSearch />
            )}
          </div>
        </div>

        <PopularDestinations />

        <div className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mt-10">
              <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
                <div className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    <Plane className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Pesquisa de Voos</p>
                  <p className="mt-2 ml-16 text-base text-gray-500">
                    Compare voos de diversas companhias aéreas com preços e disponibilidade em tempo real.
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    <Hotel className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Reserva de Hotéis</p>
                  <p className="mt-2 ml-16 text-base text-gray-500">
                    Encontre a acomodação perfeita em nossa seleção de hotéis e resorts.
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    <Map className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Atividades</p>
                  <p className="mt-2 ml-16 text-base text-gray-500">
                    Descubra e reserve atividades e passeios emocionantes no seu destino.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => {
          setShowLoginModal(false);
          setShowSearchForm(true);
        }}
      />
    </div>
  );
}