import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { setRole, setUserEmail } from '../services/api';
import { ShieldCheck, Lock, Mail, ChevronRight, Fingerprint, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', {
        email: email,
        password: password
      });
      const userRole = res.data.role || 'bank';
      setRole(userRole);
      setUserEmail(email);
      navigate(userRole === 'gov' ? '/dashboard' : '/predict');
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
            setError('Login failed. Please check your credentials.');
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
      <div className="glass-card p-10 w-full max-w-lg relative border-t-8 border-indigo-600 bg-white dark:bg-slate-900 shadow-3xl overflow-hidden">
        {/* Abstract background element */}
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl" />
        
        <div className="text-center mb-10 relative z-10">
           <div className="inline-flex p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 mb-6 group">
                <ShieldCheck className="h-10 w-10 text-indigo-600 group-hover:scale-110 transition-transform duration-500" />
           </div>
           <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-500 mb-2">System Access</p>
           <h1 className="text-4xl font-bold uppercase tracking-tighter">Sign In</h1>
        </div>
        
        {error && (
          <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest text-center animate-shake">
            <span className="flex items-center justify-center gap-2"><Lock className="h-3 w-3" /> {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 block">Email Address</label>
            <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-indigo-600 transition-colors" />
                <input 
                  type="email" required
                  value={email} onChange={(e)=>setEmail(e.target.value)}
                  className="input-field pl-12"
                  placeholder="name@company.com"
                />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 block">Password</label>
            <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-indigo-600 transition-colors" />
                <input 
                  type={showPassword ? "text" : "password"} required
                  value={password} onChange={(e)=>setPassword(e.target.value)}
                  className="input-field pl-12 pr-12"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-indigo-600 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
            </div>
          </div>
          
          <button 
            type="submit" disabled={loading}
            className="btn-primary w-full py-5 text-sm tracking-[0.2em] shadow-indigo-500/20 flex items-center justify-center gap-3 group"
          >
            {loading ? 'SIGNING IN...' : <>SIGN IN <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></>}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
              Station not registered? <Link to="/register" className="text-indigo-600 hover:text-indigo-500 transition-colors ml-1">Create Account</Link>
            </p>
        </div>
      </div>
    </div>
  );
}
