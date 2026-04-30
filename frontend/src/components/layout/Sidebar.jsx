import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  History, 
  Settings, 
  LogOut, 
  Sun, 
  Moon, 
  EyeOff, 
  Eye, 
  TrendingUp,
  ChevronRight,
  ShieldCheck,
  Brain,
  Zap
} from 'lucide-react';
import { getToken, clearToken, getRole } from '../../services/api';

export default function Sidebar({ darkMode, toggleTheme, privacyMode, togglePrivacy }) {
  const location = useLocation();
  const token = getToken();
  const role = getRole();

  const handleLogout = () => {
    clearToken();
    window.location.href = '/login';
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: BarChart3 },
    { name: 'Predict', path: '/predict', icon: Brain },
    { name: 'History', path: '/history', icon: History },
    { name: 'Compare', path: '/compare', icon: ShieldCheck, roles: ['bank', 'admin', 'gov'] },
    { name: 'Admin', path: '/admin', icon: Settings, roles: ['admin'] },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 bg-[#0f172a] dark:bg-[#0f172a] bg-white border-r border-slate-200 dark:border-white/5 flex flex-col z-[100] transition-colors duration-300">
      {/* Brand */}
      <div className="p-6 flex items-center gap-3">
        <div className="bg-indigo-600 p-2 rounded-lg">
            <BarChart3 className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Income<span className="text-indigo-600">Insight</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 mt-4 space-y-1">
        {navLinks.filter(link => !link.roles || link.roles.includes(role)).map((link) => (
          <Link
            key={link.name}
            to={link.path}
            className={`group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${
              isActive(link.path)
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
                <link.icon className={`h-5 w-5 ${isActive(link.path) ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'} transition-colors`} />
                <span className="font-bold text-sm tracking-wide">{link.name}</span>
            </div>
            {isActive(link.path) && <ChevronRight className="h-4 w-4" />}
          </Link>
        ))}
      </nav>

      {/* Footer / Settings */}
      <div className="p-4 mt-auto border-t border-slate-100 dark:border-white/5 space-y-2">
        {token && (
           <button 
             onClick={togglePrivacy} 
             className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
               privacyMode 
                 ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                 : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent'
             }`}
           >
                <div className="flex items-center gap-3">
                    {privacyMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="text-[10px] font-bold uppercase tracking-widest">Privacy Mode</span>
                </div>
                <div className={`h-2 w-2 rounded-full ${privacyMode ? 'bg-red-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-700'}`} />
           </button>
        )}

        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between p-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all border border-transparent group"
        >
            <div className="flex items-center gap-3">
                {darkMode ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4" />}
                <span className="text-[10px] font-bold uppercase tracking-widest">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </div>
            <div className="text-[10px] font-mono opacity-40">ALT+T</div>
        </button>

        {token ? (
          <button 
            onClick={handleLogout} 
            className="w-full mt-4 p-4 bg-slate-100 dark:bg-slate-800 hover:bg-red-600 text-slate-600 dark:text-slate-300 hover:text-white rounded-xl transition-all flex items-center justify-center gap-2 group font-black text-[10px] uppercase tracking-widest"
          >
            <LogOut className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Sign Out
          </button>
        ) : (
          <Link 
            to="/login" 
            className="w-full mt-4 p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all flex items-center justify-center gap-2 font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-500/20"
          >
            Sign In
          </Link>
        )}
      </div>

      {/* Version Stagger */}
      <div className="p-4 text-[9px] uppercase font-medium tracking-[0.2em] opacity-40 text-center text-slate-900 dark:text-white">
        Income Insight v1.0
      </div>
    </aside>
  );
}
