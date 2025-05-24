import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-gray-900">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Sobre o TravelSim</h3>
            <p className="text-gray-400 text-sm">
              Planeje sua viagem perfeita pelo Brasil com preços em tempo real para hotéis e atividades.
            </p>
          </div>
          
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Links Úteis</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-white text-sm">
                  Perguntas Frequentes
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-gray-400 hover:text-white text-sm">
                  Carreiras
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Suporte</h3>
            <ul className="space-y-2">
              <li>
                <a href="mailto:suporte@travelsim.com" className="text-gray-400 hover:text-white text-sm">
                  suporte@travelsim.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800">
          <p className="text-gray-400 text-sm text-center">
            © {new Date().getFullYear()} TravelSim. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}