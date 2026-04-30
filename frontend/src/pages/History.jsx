import { useState, useEffect } from 'react';
import api from '../services/api';
import { Download, Search, Printer, X, Eye, TrendingUp, Sliders, Activity, Brain } from 'lucide-react';

function DetailsModal({ entry, onClose }) {
  if (!entry) return null;

  const getStatusClass = () => {
    if (entry.loan_status === 'Approved') return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    return 'bg-red-500/10 text-red-500 border-red-500/20';
  };

  return (
    <div className="fixed inset-0 z-[101] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-enter">
      <div className="glass-card max-w-4xl w-full max-h-[90vh] overflow-y-auto relative border-t-8 border-indigo-600">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-all z-10 text-slate-400">
          <X className="h-5 w-5" />
        </button>

        <div className="p-10">
          <div className="flex justify-between items-start mb-8 border-b border-slate-100 dark:border-white/5 pb-8">
            <div>
               <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Prediction Record</p>
               <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sensitive-data">{entry.applicant_name}</h2>
               <p className="text-xs font-mono text-indigo-600 mt-2 font-bold bg-indigo-50 dark:bg-indigo-500/5 px-2 py-1 rounded inline-block">{entry.ref_id}</p>
            </div>
            <div className={`px-4 py-1.5 rounded-lg border font-bold uppercase tracking-widest text-[10px] ${getStatusClass()}`}>
                {entry.loan_status}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-card p-6 border-l-4 border-indigo-600">
                        <p className="text-[9px] uppercase font-bold text-slate-500 tracking-widest mb-4">Decision Outcome</p>
                        <div className="space-y-4">
                            <div className="flex justify-between items-end border-b border-slate-100 dark:border-white/5 pb-2">
                                <span className="text-[10px] uppercase font-bold text-slate-400">Income Level</span>
                                <span className="font-bold text-xl">{entry.prediction}</span>
                            </div>
                            <div className="flex justify-between items-end border-b border-slate-100 dark:border-white/5 pb-2">
                                <span className="text-[10px] uppercase font-bold text-slate-400">Loan Amount</span>
                                <span className="font-bold text-xl text-emerald-600">${entry.loan_amount.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="glass-card p-6 border-l-4 border-indigo-600">
                        <p className="text-[9px] uppercase font-bold text-slate-500 tracking-widest mb-4">Applicant Profile</p>
                        <div className="grid grid-cols-2 gap-y-4 text-[11px]">
                            <div><p className="text-slate-500 font-bold uppercase text-[9px]">Age</p><p className="font-bold text-slate-900 dark:text-white">{entry.age} Years</p></div>
                            <div><p className="text-slate-500 font-bold uppercase text-[9px]">Hours/Week</p><p className="font-bold text-slate-900 dark:text-white">{entry.hours_per_week}h</p></div>
                            <div className="col-span-2"><p className="text-slate-500 font-bold uppercase text-[9px]">Education</p><p className="font-bold text-slate-900 dark:text-white">{entry.education}</p></div>
                        </div>
                    </div>
                </div>

                {entry.explainability && (
                  <div className="glass-card p-6">
                    <h3 className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-6 flex items-center gap-2">
                      <Brain className="h-4 w-4 text-indigo-600" /> AI Factor Analysis
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                      {Object.entries(entry.explainability).filter(([k]) => !k.startsWith('_')).map(([feature, impact]) => (
                        <div key={feature}>
                          <div className="flex justify-between text-[9px] mb-1.5 font-bold text-slate-500 uppercase tracking-wide">
                            <span>{feature}</span><span>{impact}%</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-indigo-600 h-full rounded-full transition-all duration-1000" style={{ width: `${impact}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            <div className="space-y-6">
                <div className="glass-card p-6 border-slate-100 dark:border-white/5">
                   <p className="text-[9px] uppercase font-bold text-slate-500 tracking-widest mb-4">Audit Trail</p>
                   <div className="space-y-4 text-[10px]">
                        <div className="flex justify-between border-b border-slate-100 dark:border-white/5 pb-2">
                            <span className="text-slate-400 font-bold">CREATED BY</span>
                            <span className="font-bold text-slate-700 dark:text-slate-200 uppercase">{entry.creator_name || 'System'}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 dark:border-white/5 pb-2">
                           <span className="text-slate-400 font-bold">DATE</span>
                           <span className="font-bold text-slate-700 dark:text-slate-200">{new Date(entry.timestamp).toLocaleDateString()}</span>
                        </div>
                   </div>
                </div>

                <div className="p-6 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 text-center">
                    <Activity className="h-6 w-6 mx-auto text-slate-300 mb-3" />
                    <p className="text-[9px] uppercase font-bold text-slate-400 tracking-widest leading-relaxed">
                        Secure Audit Record // Enterprise Vault
                    </p>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function History() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/predict/history');
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleExport = () => {
    window.open('http://localhost:8000/api/v1/export', '_blank');
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const filtered = data.filter(d => 
    Object.values(d).some(val => String(val).toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="animate-enter print:animate-none pb-20 space-y-8">
      {selectedEntry && <DetailsModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />}

      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">History</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">View and export past predictions</p>
        </div>
        <div className="flex w-full md:w-auto gap-3 print:hidden">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input 
              type="text" placeholder="Search by name or ID..." 
              value={search} onChange={(e)=>setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-sm text-slate-900 dark:text-white" 
            />
          </div>
          <button onClick={handleExport} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-500 hover:text-indigo-600 transition-all group" title="Export CSV">
            <Download className="h-5 w-5" />
          </button>
          <button onClick={handlePrintPDF} className="flex items-center px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs tracking-widest transition-all shadow-lg shadow-indigo-500/20">
            <Printer className="mr-2 h-4 w-4" /> Export PDF
          </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden border-t-4 border-indigo-600 print:shadow-none print:border-none print:bg-white print:text-black">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-white/10 uppercase font-bold text-[10px] tracking-widest text-slate-500">
                <th className="p-5">Record ID</th>
                <th className="p-5">Full Name</th>
                <th className="p-5">Result</th>
                <th className="p-5">Risk Level</th>
                <th className="p-5">Loan Amount</th>
                <th className="p-5">Created By</th>
                <th className="p-5">Timestamp</th>
                <th className="p-5 print:hidden text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="font-medium text-slate-700 dark:text-slate-200">
              {loading ? (
                <tr><td colSpan="8" className="p-20 text-center text-slate-500 animate-pulse font-bold uppercase tracking-widest">Loading history...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="8" className="p-20 text-center text-slate-500 uppercase font-bold tracking-widest">No matching records found.</td></tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition group">
                    <td className="p-5 font-mono text-[11px] text-indigo-600">
                      {item.ref_id || `${String(item.id).padStart(8, '0')}`}
                    </td>
                    <td className="p-5 text-sm sensitive-data">
                      {item.applicant_name || 'Anonymous User'}
                    </td>
                    <td className="p-5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${item.prediction === '>50K' ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5' : 'border-indigo-500/30 text-indigo-600 bg-indigo-500/5'}`}>
                        {item.prediction}
                      </span>
                    </td>
                    <td className="p-5">
                        <span className={`text-[11px] font-bold uppercase ${item.risk_level === 'High' ? 'text-red-500' : item.risk_level === 'Low' ? 'text-emerald-500' : 'text-indigo-600'}`}>
                            {item.risk_level}
                        </span>
                    </td>
                    <td className="p-5 text-sm font-mono text-emerald-600">${item.loan_amount.toLocaleString()}</td>
                    <td className="p-5 text-[11px] text-slate-500 uppercase">{item.creator_name || 'System'}</td>
                    <td className="p-5 text-[10px] text-slate-500 font-mono italic">{new Date(item.timestamp).toLocaleString()}</td>
                    <td className="p-5 text-center print:hidden">
                       <button onClick={() => setSelectedEntry(item)} className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 hover:border-indigo-600 text-slate-400 hover:text-indigo-600 transition-all">
                          <Eye className="h-4 w-4" />
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
