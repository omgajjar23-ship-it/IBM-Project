import { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  LineChart, Line,
} from 'recharts';
import api from '../services/api';
import { getRole } from '../services/api';
import { Activity, BarChart as BarChartIcon, TrendingUp, BookOpen, Briefcase } from 'lucide-react';

const RISK_COLORS = ['#10b981', '#f59e0b', '#ef4444'];

// ── Skeleton stat card ───────────────────────────────────────────────────────
function SkeletonStat() {
  return <div className="glass-card p-6 h-28 animate-pulse bg-gray-300/10 dark:bg-gray-700/20 rounded-2xl" />;
}

export default function Dashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState('overview');
  const role                  = getRole();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/analytics/');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handlePowerBIConnect = () => {
    const pbids = {
      version: "0.1",
      connections: [{
        details: { protocol: "http", address: { url: "http://localhost:8000/api/v1/export/?api_key=powerbi-secret-key-123" }, authentication: null, query: null },
        options: {}, mode: "Import",
      }],
    };
    const blob = new Blob([JSON.stringify(pbids, null, 2)], { type: "application/json" });
    const url  = window.URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "Income_Insight_Live.pbids";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const riskData = data ? [
    { name: 'Low Risk',    value: data.low_risk_count    },
    { name: 'Medium Risk', value: data.medium_risk_count },
    { name: 'High Risk',   value: data.high_risk_count   },
  ] : [];

  return (
    <div className="animate-enter space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              {role === 'bank' ? 'Analytics Dashboard' : 'System Oversight'}
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-1">Real-time insights and system performance</p>
        </div>
        
        {/* Tab navigation */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-white/5 shadow-inner">
          {['overview', 'education', 'occupation', 'trend'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all
                ${tab === t ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPI row ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? (
          [1,2,3,4].map(i => <SkeletonStat key={i} />)
        ) : (
          <>
            <div className="glass-card p-6 border-l-4 border-indigo-600 flex flex-col justify-between">
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Total Records</p>
                <h3 className="text-4xl font-bold mt-1 text-slate-900 dark:text-white">{data?.total_applications ?? 0}</h3>
              </div>
              <div className={`mt-3 text-[10px] font-bold uppercase flex items-center ${data?.trends?.applications >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {data?.trends?.applications >= 0 ? '↑' : '↓'} {Math.abs(data?.trends?.applications)}% <span className="text-slate-400 ml-1">v7d</span>
              </div>
            </div>
            <div className="glass-card p-6 border-l-4 border-emerald-500 flex flex-col justify-between">
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Approved Value</p>
                <h3 className="text-4xl font-bold mt-1 text-slate-900 dark:text-white">${(data?.approved_loans_value ?? 0).toLocaleString(undefined, {maximumFractionDigits: 0})}</h3>
              </div>
              <div className="mt-3 text-[10px] font-bold uppercase text-emerald-600 flex items-center">
                ↑ {data?.trends?.approval_rate}% <span className="text-slate-400 ml-1">growth</span>
              </div>
            </div>
            <div className="glass-card p-6 border-l-4 border-amber-500 flex flex-col justify-between">
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Rejection Rate</p>
                <h3 className="text-4xl font-bold mt-1 text-slate-900 dark:text-white">{data?.rejection_rate ?? 0}%</h3>
              </div>
              <div className="mt-3 text-[10px] font-bold uppercase text-emerald-600 flex items-center">
                ↓ 0.5% <span className="text-slate-400 ml-1">lower</span>
              </div>
            </div>
            <div className="glass-card p-6 border-l-4 border-red-500 flex flex-col justify-between">
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Risk Alerts</p>
                <h3 className="text-4xl font-bold mt-1 text-slate-900 dark:text-white">{data?.high_risk_count ?? 0}</h3>
              </div>
              <div className="mt-3 text-[10px] font-bold uppercase text-emerald-600 flex items-center">
                ↓ 1.2% <span className="text-slate-400 ml-1">trend</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── AI Summary Section ───────────────────────────────────────────── */}
      {!loading && data?.ai_summary && (
        <div className="glass-card p-6 border-l-8 border-indigo-600 bg-indigo-500/5 animate-enter shadow-lg shadow-indigo-500/5">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-500/20">
                    <Activity className="h-5 w-5" />
                </div>
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">AI Narrative Summary</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-bold italic text-lg px-2">
                "{data.ai_summary}"
            </p>
        </div>
      )}

      {/* ── Tab content ─────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex justify-center py-20"><Activity className="animate-spin text-indigo-600 h-10 w-10" /></div>
      ) : !data ? (
        <div className="text-center p-10 opacity-50">Error: Could not load analytics data.</div>
      ) : (
        <div className="grid grid-cols-1 gap-8 transition-all duration-500">
          {/* Overview */}
          {tab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="glass-card p-8">
                <h2 className="text-[10px] font-bold uppercase tracking-widest mb-6 flex items-center gap-2 text-indigo-600"><BarChartIcon className="h-4 w-4" /> Risk Distribution</h2>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={riskData} cx="50%" cy="50%" innerRadius={85} outerRadius={115} stroke="none" paddingAngle={4} dataKey="value">
                        {riskData.map((_, i) => <Cell key={i} fill={RISK_COLORS[i % RISK_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }} />
                      <Legend verticalAlign="bottom" align="center" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="glass-card p-8">
                <h2 className="text-[10px] font-bold uppercase tracking-widest mb-6 flex items-center gap-2 text-indigo-600"><BarChartIcon className="h-4 w-4" /> Assessment Volume</h2>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={riskData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                      <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {riskData.map((_, i) => <Cell key={i} fill={RISK_COLORS[i % RISK_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Education breakdown */}
          {tab === 'education' && (
            <div className="glass-card p-8">
              <h2 className="text-[10px] font-bold uppercase tracking-widest mb-8 flex items-center gap-2 text-indigo-600"><BookOpen className="h-4 w-4" /> Education Level Metrics</h2>
              {data.education_breakdown.length === 0 ? (
                <p className="p-20 text-center opacity-30 font-bold uppercase tracking-widest text-xs">Waiting for dataset accumulation...</p>
              ) : (
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.education_breakdown} layout="vertical" margin={{ left: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.05} horizontal={false} />
                      <XAxis type="number" axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="education" tick={{ fontSize: 10, fontWeight: 'bold' }} width={120} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }} />
                      <Legend />
                      <Bar dataKey="above_50k" name="Income >50K" fill="#4f46e5" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="below_50k" name="Income ≤50K"  fill="#94a3b8" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* Occupation breakdown */}
          {tab === 'occupation' && (
            <div className="glass-card p-8">
              <h2 className="text-[10px] font-bold uppercase tracking-widest mb-8 flex items-center gap-2 text-indigo-600"><Briefcase className="h-4 w-4" /> Approval Rates by Sector</h2>
              {data.occupation_breakdown.length === 0 ? (
                <p className="p-20 text-center opacity-30 font-bold uppercase tracking-widest text-xs">Waiting for dataset accumulation...</p>
              ) : (
                <div className="h-[360px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.occupation_breakdown}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.05} />
                      <XAxis dataKey="occupation" tick={{ fontSize: 9, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                      <YAxis unit="%" domain={[0, 100]} axisLine={false} tickLine={false} />
                      <Tooltip formatter={(v) => `${v}%`} contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none' }} />
                      <Bar dataKey="approval_rate" name="Approval Rate" fill="#6366f1" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* trend */}
          {tab === 'trend' && (
            <div className="glass-card p-8">
              <h2 className="text-[10px] font-bold uppercase tracking-widest mb-8 flex items-center gap-2 text-indigo-600"><TrendingUp className="h-4 w-4" /> Weekly Volume Trend</h2>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.daily_trend}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.05} />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none' }} />
                    <Line type="monotone" dataKey="predictions" name="Volume" stroke="#6366f1" strokeWidth={4} dot={{ r: 6, fill: '#6366f1', strokeWidth: 0 }} activeDot={{ r: 8, strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Power BI integration strip */}
      <div className="glass-card p-10 border-l-8 border-indigo-600 bg-gradient-to-r from-indigo-500/5 to-transparent flex flex-col md:flex-row items-center justify-between gap-6 group">
        <div className="flex items-center">
            <div className="bg-indigo-600 p-4 rounded-2xl mr-6 text-white shadow-2xl shadow-indigo-500/40 group-hover:scale-110 transition duration-500">
                <BarChartIcon className="h-10 w-10" />
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Export to Power BI</h2>
              <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mt-1">Connect live system data to your enterprise BI tools</p>
            </div>
        </div>
        <button onClick={handlePowerBIConnect} className="px-8 py-4 font-bold uppercase tracking-widest bg-indigo-600 text-white rounded-xl shadow-xl hover:bg-indigo-700 transition-all duration-300">
            Download Connector
        </button>
      </div>
    </div>
  );
}
