import { Link } from 'react-router-dom';
import { Plane, LogOut, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export function Navigation() {
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Plane className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-semibold">TravelSim</span>
          </Link>

          <div className="flex items-center space-x-4">
            <Link
              to="/faq"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              FAQ
            </Link>
            {user ? (
              <>
              
                <Link
                  to="/profile"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  <User className="h-4 w-4 mr-1" />
                  Perfil
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Sair
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <User className="h-4 w-4 mr-1" />
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}