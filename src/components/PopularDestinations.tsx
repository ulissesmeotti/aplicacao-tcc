import { MapPin } from 'lucide-react';
import curitiba from '../images/img-curitiba.jpg';
import florianopolis from '../images/img-florianopolis.jpg';
import fozDeIguacu from '../images/img-fozdeiguacu.jpg';
import rioDeJaneiro from '../images/img-riodejaneiro.jpg';
import salvador from '../images/img-salvador.jpg';
import saoPaulo from '../images/img-saopaulo.jpg';

const destinations = [
  {
    name: 'Rio de Janeiro',
    state: 'RJ',
    image: rioDeJaneiro,
    description: 'Cidade maravilhosa com praias deslumbrantes e o Cristo Redentor',
  },
  {
    name: 'São Paulo',
    state: 'SP',
    image: saoPaulo,
    description: 'A maior cidade do Brasil, centro financeiro e cultural',
  },
  {
    name: 'Salvador',
    state: 'BA',
    image: salvador,
    description: 'Rica história, cultura afro-brasileira e praias paradisíacas',
  },
  {
    name: 'Foz do Iguaçu',
    state: 'PR',
    image: fozDeIguacu,
    description: 'Cataratas majestosas e uma das maravilhas naturais do mundo',
  },
  {
    name: 'Florianópolis',
    state: 'SC',
    image: florianopolis,
    description: 'Ilha da Magia com 42 praias paradisíacas',
  },
  {
    name: 'Curitiba',
    state: 'PR',
    image: curitiba,
    description: 'Cidade modelo em planejamento urbano e qualidade de vida',
  },
];
export function PopularDestinations() {
  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Destinos mais populares no Brasil</h2>
          <p className="mt-4 text-lg text-gray-600">
            Descubra os lugares mais visitados e amados pelos viajantes
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((destination) => (
            <div
              key={destination.name}
              className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative h-64">
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="flex items-center mb-2">
                  <MapPin className="h-5 w-5 mr-2" />
                  <h3 className="text-xl font-semibold">
                    {destination.name}, {destination.state}
                  </h3>
                </div>
                <p className="text-sm text-gray-200">{destination.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}