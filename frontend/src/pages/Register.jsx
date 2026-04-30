import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { UserPlus, User as UserIcon, Mail, Lock, ChevronRight, Fingerprint, ShieldCheck, Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('bank');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/register', {
        email, name, password, role
      });
      navigate('/login');
    } catch (err) {
      if (err.response?.data) {
        if (err.response.data.detail) {
          setError(err.response.data.detail);
        } else {
          // Extract first field error if DRF returns an object with arrays
          const firstKey = Object.keys(err.response.data)[0];
          if (firstKey && Array.isArray(err.response.data[firstKey])) {
            setError(err.response.data[firstKey][0]);
          } else {
            setError('Registration failed. Please try again.');
          }
        }
      } else {
        setError('Network error. Is the backend running?');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[85vh] animate-enter">
      <div className="glass-card p-10 w-full max-w-2xl relative border-t-8 border-indigo-600 bg-white dark:bg-slate-900 shadow-3xl overflow-hidden">
        {/* Abstract background element */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl opacity-50" />
        
        <div className="text-center mb-10 relative z-10">
           <div className="inline-flex p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 mb-6 group">
                <UserPlus className="h-10 w-10 text-indigo-600 group-hover:scale-110 transition-transform duration-500" />
           </div>
           <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-500 mb-2">Account Registration</p>
           <h1 className="text-4xl font-bold uppercase tracking-tighter">Join Platform</h1>
        </div>
        
        {error && (
          <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest text-center animate-shake">
            <span className="flex items-center justify-center gap-2 font-black">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 block">Full Name</label>
                <div className="relative group">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-indigo-600 transition-colors" />
                    <input required type="text" value={name} onChange={(e)=>setName(e.target.value)} className="input-field pl-12" placeholder="John Doe" />
                </div>
            </div>

            <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 block">Email Address</label>
                <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-indigo-600 transition-colors" />
                    <input required type="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="input-field pl-12" placeholder="name@company.com" />
                </div>
            </div>

            <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 block">Password</label>
                <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-indigo-600 transition-colors" />
                    <input required type={showPassword ? "text" : "password"} value={password} onChange={(e)=>setPassword(e.target.value)} className="input-field pl-12 pr-12" placeholder="••••••••••••" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-indigo-600 transition-colors focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
            </div>

            <div className="md:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 block">User Role</label>
                <select value={role} onChange={(e)=>setRole(e.target.value)} className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-5 py-4 text-sm font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none text-slate-900 dark:text-white">
                    <option value="bank" className="bg-white dark:bg-slate-900">🏦 Bank Agent</option>
                    <option value="gov"  className="bg-white dark:bg-slate-900">⚖️ Audit Agent</option>
                </select>
            </div>
          </div>
          
          <button type="submit" disabled={loading} className="btn-primary w-full py-5 text-sm tracking-[0.2em] shadow-indigo-500/20 flex items-center justify-center gap-3 group">
            {loading ? 'REGISTERING...' : <>CREATE ACCOUNT <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></>}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
              Already have an account? <Link to="/login" className="text-indigo-600 hover:text-indigo-500 transition-colors ml-1">Sign In</Link>
            </p>
        </div>
      </div>
    </div>
  );
}
