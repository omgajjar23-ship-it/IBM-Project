import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, ShieldCheck, Zap, Activity, Globe, Database, Cpu } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] animate-enter relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="text-center max-w-5xl px-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-10">
            <Zap className="h-3 w-3" /> AI-Powered Income Prediction
        </div>
        
        <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-8 leading-[0.9] text-slate-900 dark:text-white">
          Income <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-400 to-indigo-700">
            Insight
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-500 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
          The professional platform for <span className="text-indigo-600 font-bold">Income Prediction</span> and financial analytics. 
          Accurate Risk Assessment // Transparent AI Insights // Enterprise-Grade Security.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
          <Link to="/predict" className="btn-primary px-10 py-4 text-xs tracking-widest flex items-center group shadow-indigo-500/20">
            GET STARTED <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/dashboard" className="px-10 py-4 rounded-xl glass-card font-bold text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/5 transition flex items-center border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300">
            <Activity className="mr-3 h-4 w-4 text-indigo-600" /> VIEW DASHBOARD
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 w-full max-w-6xl px-4">
        <div className="glass-card p-10 group hover:border-indigo-600/30 transition-all duration-500 relative overflow-hidden bg-white/50 dark:bg-slate-900/50">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-indigo-600"><Globe className="h-16 w-16" /></div>
          <Cpu className="h-10 w-10 text-indigo-600 mb-6 group-hover:scale-110 transition-transform" />
          <h3 className="text-lg font-bold tracking-tight mb-3 text-slate-900 dark:text-white">AI Analysis</h3>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">
            Advanced machine learning models analyze multiple data points to predict income levels with high accuracy and confidence.
          </p>
        </div>
        
        <div className="glass-card p-10 group hover:border-emerald-500/30 transition-all duration-500 relative overflow-hidden bg-white/50 dark:bg-slate-900/50">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-emerald-600"><ShieldCheck className="h-16 w-16" /></div>
          <Database className="h-10 w-10 text-emerald-500 mb-6 group-hover:scale-110 transition-transform" />
          <h3 className="text-lg font-bold tracking-tight mb-3 text-slate-900 dark:text-white">Audit Ready</h3>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">
            Transparent explainability engine provide clear insights into decision factors, ensuring regulatory-grade compliance.
          </p>
        </div>
        
        <div className="glass-card p-10 group hover:border-indigo-600/30 transition-all duration-500 relative overflow-hidden bg-white/50 dark:bg-slate-900/50">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-indigo-400"><Activity className="h-16 w-16" /></div>
          <BarChart3 className="h-10 w-10 text-indigo-600 mb-6 group-hover:scale-110 transition-transform" />
          <h3 className="text-lg font-bold tracking-tight mb-3 text-slate-900 dark:text-white">System Analytics</h3>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">
            Real-time demographic data aggregation provides deep insights into income trends and distribution patterns.
          </p>
        </div>
      </div>
    </div>
  );
}
