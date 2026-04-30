import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import Papa from 'papaparse';
import { useToast } from '../components/Toast';
import { Activity, AlertTriangle, CheckCircle, Database, UploadCloud, Sliders, Clock, ChevronRight, Brain } from 'lucide-react';

// ── Skeleton card placeholder ────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="glass-card p-8 animate-pulse flex flex-col gap-4">
      <div className="h-5 bg-gray-300/30 dark:bg-gray-700/50 rounded w-2/3" />
      <div className="grid grid-cols-2 gap-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="h-20 bg-gray-300/20 dark:bg-gray-700/40 rounded-xl" />
        ))}
      </div>
      <div className="h-4 bg-gray-300/20 dark:bg-gray-700/40 rounded w-full" />
      <div className="h-4 bg-gray-300/20 dark:bg-gray-700/40 rounded w-3/4" />
    </div>
  );
}

// ── Validation helpers ────────────────────────────────────────────────────────
function validate(formData) {
  const errors = {};
  if (formData.age < 18 || formData.age > 80) errors.age = 'Age must be between 18 and 80.';
  if (formData.hours_per_week < 1 || formData.hours_per_week > 99) errors.hours_per_week = 'Hours must be between 1 and 99.';
  return errors;
}

export default function Predict() {
  const toast = useToast();

  const [mode, setMode]       = useState('single');
  const [formData, setFormData] = useState({
    applicant_name: '',
    age: 35, workclass: 'Private', education: 'Bachelors',
    occupation: 'Exec-managerial', hours_per_week: 40,
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [sandbox, setSandbox] = useState(false);

  // Async batch state
  const [batchJob, setBatchJob]       = useState(null); // { job_id, total }
  const [batchStatus, setBatchStatus] = useState(null); // { status, progress, total }
  const pollRef = useRef(null);

  const handleChange = (e) => {
    const val = e.target.type === 'number' || e.target.type === 'range'
      ? Number(e.target.value) : e.target.value;
    setFormData(prev => ({ ...prev, [e.target.name]: val }));
    if (validationErrors[e.target.name]) {
      setValidationErrors(prev => { const n = {...prev}; delete n[e.target.name]; return n; });
    }
  };

  // Sandbox auto-predict (debounced)
  useEffect(() => {
    if (!sandbox) return;
    const timer = setTimeout(() => handleSubmit(), 500);
    return () => clearTimeout(timer);
  }, [formData.hours_per_week, formData.age, formData.education, sandbox]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const errors = validate(formData);
    if (Object.keys(errors).length) { setValidationErrors(errors); return; }
    setLoading(true);
    try {
      const res = await api.post('/predict/', {
        ...formData,
        age: parseInt(formData.age),
        hours_per_week: parseInt(formData.hours_per_week),
      });
      setResult(res.data);
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.error || 'Prediction failed. Check your connection and try again.';
      toast({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  // ── Async batch ────────────────────────────────────────────────────────────
  const startPolling = (jobId, total) => {
    setBatchStatus({ status: 'queued', progress: 0, total });
    pollRef.current = setInterval(async () => {
      try {
        const res = await api.get(`/batch/status/${jobId}`);
        setBatchStatus(res.data);
        if (res.data.status === 'done') {
          clearInterval(pollRef.current);
          const resultRes = await api.get(`/batch/results/${jobId}`);
          const csv = Papa.unparse(resultRes.data.results);
          const blob = new Blob([csv], { type: 'text/csv' });
          const url  = window.URL.createObjectURL(blob);
          const a    = document.createElement('a');
          a.setAttribute('href', url);
          a.setAttribute('download', `batch_results_${jobId.slice(0,8)}.csv`);
          document.body.appendChild(a); a.click(); document.body.removeChild(a);
          toast({ type: 'success', message: `✅ Batch complete! ${total} records processed.` });
        } else if (res.data.status === 'failed') {
          clearInterval(pollRef.current);
          toast({ type: 'error', message: `Batch failed: ${res.data.error || 'Unknown error'}` });
        }
      } catch {
        clearInterval(pollRef.current);
        toast({ type: 'error', message: 'Lost connection to batch job.' });
      }
    }, 2000);
  };

  const handleBatchUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBatchJob(null); setBatchStatus(null);
    if (pollRef.current) clearInterval(pollRef.current);

    Papa.parse(file, {
      header: true, skipEmptyLines: true,
      complete: async (parsed) => {
        try {
          const payload = parsed.data.map(r => ({
            applicant_name: r.applicant_name || 'CSV Batch User',
            age:           parseInt(r.age || 30),
            workclass:     r.workclass || 'Private',
            education:     r.education || 'Bachelors',
            occupation:    r.occupation || 'Sales',
            hours_per_week: parseInt(r.hours_per_week || 40),
          }));
          const res = await api.post('/batch/submit', payload);
          const { job_id, total } = res.data;
          setBatchJob({ job_id, total });
          startPolling(job_id, total);
        } catch (err) {
          toast({ type: 'error', message: 'Failed to submit batch.' });
        }
      },
    });
  };

  const batchPercent = batchStatus
    ? Math.round((batchStatus.progress / (batchStatus.total || 1)) * 100) : 0;

  // ── Theme Helper ──────────────────────────────────────────────────
  const getResultClass = () => {
    if (!result) return 'from-slate-50 to-white dark:from-slate-900 dark:to-slate-800';
    if (result.prediction === '>50K') return 'from-emerald-50 dark:from-emerald-500/10 border-emerald-500/20';
    return 'from-slate-50 dark:from-indigo-500/10 border-indigo-500/20';
  };

  return (
    <div className="flex flex-col gap-8 animate-enter">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
           <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Income Prediction</h1>
           <p className="text-slate-500 text-sm font-medium mt-1">Analyze individual or batch records using AI insights</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-white/10">
          <button onClick={() => setMode('single')} className={`px-5 py-2 text-[11px] font-bold uppercase tracking-widest rounded-lg transition-all ${mode === 'single' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>Individual</button>
          <button onClick={() => setMode('batch')}  className={`px-5 py-2 text-[11px] font-bold uppercase tracking-widest rounded-lg transition-all ${mode === 'batch'  ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>Bulk CSV</button>
        </div>
      </div>

      {mode === 'batch' && (
        <div className="flex flex-col gap-6">
          <label className="glass-card p-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-600 cursor-pointer relative transition-all group overflow-hidden">
            <div className="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <input type="file" accept=".csv" onChange={handleBatchUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            <UploadCloud className="h-16 w-16 mx-auto mb-6 text-slate-300 group-hover:text-indigo-600 transition-all transform group-hover:-translate-y-1" />
            <h2 className="text-2xl font-bold tracking-tight mb-2 text-slate-900 dark:text-white">Upload CSV Records</h2>
            <p className="text-slate-500 text-sm font-medium">Select a file to begin batch processing</p>
          </label>
          {batchStatus && (
            <div className="glass-card p-8 border-l-8 border-indigo-600">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[10px] dark:text-slate-400 uppercase tracking-widest flex items-center gap-2"><Clock className="h-4 w-4 text-indigo-600" /> Processing ID: <span className="font-mono text-indigo-600">{batchJob?.job_id?.slice(0,12)}</span></h3>
                <span className="text-[10px] font-bold uppercase bg-indigo-600 text-white px-3 py-1 rounded shadow-lg shadow-indigo-500/30">{batchStatus.status}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-4 overflow-hidden border border-slate-200 dark:border-white/10">
                <div className="h-full bg-indigo-600 transition-all duration-700" style={{ width: `${batchPercent}%` }} />
              </div>
              <div className="mt-3 flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <span>Memory usage: {(batchPercent * 0.4).toFixed(1)}GB</span>
                <span>Progress: {batchPercent}%</span>
              </div>
            </div>
          )}
        </div>
      )}

      {mode === 'single' && (
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-1 glass-card p-10 relative">
            <div className="flex justify-between items-center mb-10 border-b border-slate-100 dark:border-white/5 pb-6">
              <h2 className="text-[10px] font-bold uppercase tracking-widest flex items-center text-slate-500 group"><Sliders className="mr-3 h-4 w-4 group-hover:text-indigo-600 transition-colors" /> Applicant Data</h2>
              <button onClick={() => setSandbox(!sandbox)} 
                className={`flex items-center px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${sandbox ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/20' : 'bg-slate-50 dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-white/10 hover:border-indigo-600'}`}>
                Simulation {sandbox ? 'On' : 'Off'}
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">Full Name</label>
                <input type="text" name="applicant_name" value={formData.applicant_name} onChange={handleChange} placeholder="John Doe (Optional)" className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex justify-between">Age <span>{formData.age}</span></label>
                  <input type="range" name="age" min="18" max="80" value={formData.age} onChange={handleChange} className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                  {validationErrors.age && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{validationErrors.age}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex justify-between">Hours Needed <span>{formData.hours_per_week}</span></label>
                  <input type="range" name="hours_per_week" min="1" max="99" value={formData.hours_per_week} onChange={handleChange} className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                  {validationErrors.hours_per_week && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{validationErrors.hours_per_week}</p>}
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">Education Level</label>
                  <select name="education" value={formData.education} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none text-slate-900 dark:text-white">
                    <option>Doctorate</option><option>Masters</option><option>Bachelors</option><option>HS-grad</option><option>Some-college</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">Occupation Sector</label>
                  <select name="occupation" value={formData.occupation} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none text-slate-900 dark:text-white">
                    <option>Exec-managerial</option><option>Prof-specialty</option><option>Sales</option><option>Craft-repair</option><option>Tech-support</option>
                  </select>
                </div>
              </div>
              {!sandbox && <button type="submit" disabled={loading} className="btn-primary w-full mt-4 font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-3"> {loading ? 'Processing...' : 'Generate Prediction'} <ChevronRight className="h-4 w-4" /> </button>}
            </form>
          </div>

          <div className="flex-1 flex flex-col gap-8">
            {loading && !result ? <SkeletonCard /> : result ? (
              <>
                {/* Result Card */}
                <div className={`glass-card p-10 border-t-[8px] transition-all duration-1000 overflow-hidden relative shadow-2xl ${getResultClass()}`}>
                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <div>
                      <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sensitive-data">{result.applicant_name || 'Individual Record'}</h2>
                      <p className="text-[10px] font-mono font-bold text-indigo-600 mt-2 tracking-widest bg-indigo-500/5 px-3 py-1 rounded inline-block">{result.ref_id}</p>
                    </div>
                    <div className={`p-4 rounded-2xl ${result.prediction === '>50K' ? 'bg-emerald-500/20 text-emerald-600' : 'bg-slate-100 dark:bg-white/5 text-slate-500'}`}>
                        {result.prediction === '>50K' ? <CheckCircle className="h-8 w-8" /> : <Activity className="h-8 w-8" />}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 relative z-10">
                    <div className="bg-white/50 dark:bg-black/40 p-6 rounded-2xl border border-slate-100 dark:border-white/5">
                      <p className="text-[9px] uppercase tracking-widest font-bold text-slate-500 mb-1">Income Result</p>
                      <p className={`text-3xl font-bold ${result.prediction === '>50K' ? 'text-emerald-600' : 'text-slate-500'}`}>{result.prediction}</p>
                    </div>
                    <div className="bg-white/50 dark:bg-black/40 p-6 rounded-2xl border border-slate-100 dark:border-white/5">
                      <p className="text-[9px] uppercase tracking-widest font-bold text-slate-500 mb-1">AI Confidence</p>
                      <p className="text-3xl font-bold text-indigo-600 italic">{result.confidence}<span className="text-sm opacity-50 ml-1">%</span></p>
                    </div>
                    <div className="col-span-2 bg-gradient-to-r from-indigo-500/5 to-transparent p-6 rounded-2xl border border-indigo-500/10 flex justify-between items-center">
                      <div>
                        <p className="text-[9px] uppercase tracking-widest font-bold text-slate-500">Loan Eligibility</p>
                        <p className="text-4xl font-bold text-emerald-600 font-mono tracking-tighter mt-1">${result.loan_amount.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] uppercase tracking-widest font-bold text-slate-500">Risk Assessment</p>
                        <p className={`text-xl font-bold uppercase ${result.risk_level === 'Low' ? 'text-emerald-600' : result.risk_level === 'Medium' ? 'text-indigo-600' : 'text-red-500'}`}>{result.risk_level}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Butterfly Effect */}
                {result.explainability?._butterfly && (
                    <div className="glass-card p-6 flex items-center gap-6 border-l-8 border-indigo-600 bg-indigo-500/5 group">
                        <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-500/30 group-hover:rotate-12 transition-transform duration-500"><Sliders className="h-6 w-6" /></div>
                        <div>
                            <h3 className="font-bold text-[10px] uppercase tracking-widest text-indigo-600">Key Factor Analysis</h3>
                            <p className="text-slate-500 font-medium text-sm mt-1 leading-relaxed">
                                Adjusted **{result.explainability._butterfly.var}** would change result by **{result.explainability._butterfly.impact}%**.
                            </p>
                        </div>
                    </div>
                )}

                {/* Neural Weights */}
                <div className="glass-card p-10">
                  <h2 className="text-[10px] font-bold uppercase tracking-widest mb-8 text-slate-500 flex items-center gap-3"><Activity className="h-4 w-4 text-indigo-600" /> AI Decision Factors</h2>
                  <div className="space-y-6">
                    {Object.entries(result.explainability).filter(([k]) => !k.startsWith('_')).map(([feature, impact]) => (
                      <div key={feature} className="group">
                        <div className="flex justify-between text-[10px] mb-2 font-bold uppercase tracking-widest text-slate-400 group-hover:text-indigo-600 transition-colors">
                          <span className="flex items-center gap-2">{feature}</span>
                          <span className="font-mono">{impact}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-200 dark:border-white/5">
                          <div className="bg-indigo-600 h-full rounded-full transition-all duration-1000" style={{ width: `${impact}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="glass-card p-12 h-64 flex flex-col items-center justify-center text-center opacity-40 group">
                <Brain className="h-12 w-12 mb-4 group-hover:text-indigo-600 transition-all duration-700" />
                <p className="font-bold text-[10px] uppercase tracking-widest text-slate-500">Awaiting Record for Analysis</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

