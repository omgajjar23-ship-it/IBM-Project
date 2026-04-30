import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, TrendingUp, EyeOff, Eye } from 'lucide-react';
import { getToken, clearToken } from '../../services/api';

export default function Navbar({ darkMode, toggleTheme, privacyMode, togglePrivacy }) {
  const location = useLocation();
  const token = getToken();

  const handleLogout = () => {
    clearToken();
    window.location.href = '/login';
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Predict', path: '/predict' },
    { name: 'History', path: '/history' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Compare', path: '/compare' },
    { name: 'Admin', path: '/admin' },
  ];

  return (
    <nav className="sticky top-0 z-50 glass-card mx-4 mt-4 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <TrendingUp className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
          Income Insight
        </span>
      </div>

      <div className="hidden md:flex space-x-8">
        {navLinks.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            className={`font-medium transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 ${
              location.pathname === link.path
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            {link.name}
          </Link>
        ))}
      </div>

      <div className="flex items-center space-x-4">
        {token && (
           <button onClick={togglePrivacy} className={`p-2 rounded-full transition ${privacyMode ? 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`} title="Toggle Privacy Masking">
             {privacyMode ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
           </button>
        )}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {token ? (
          <button onClick={handleLogout} className="px-4 py-2 rounded-xl text-sm font-semibold bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition">
            Log out
          </button>
        ) : (
          <Link to="/login" className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transition">
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
