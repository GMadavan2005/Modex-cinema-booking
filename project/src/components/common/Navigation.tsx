import { Link, useLocation } from 'react-router-dom';
import { Ticket } from 'lucide-react';

export default function Navigation() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Ticket className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">ShowBook Pro</span>
          </Link>

          <div className="flex gap-6">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              Shows
            </Link>
            <Link
              to="/admin"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/admin')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
