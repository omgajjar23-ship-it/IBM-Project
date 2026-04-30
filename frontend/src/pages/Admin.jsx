import { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../components/Toast';
import { Database, ShieldAlert, Trash2, Skull, RefreshCw, AlertTriangle, X, UserPlus, Mail, Lock, User as UserIcon, Terminal, Activity, Zap, ChevronRight, Fingerprint } from 'lucide-react';

// ── Inline confirmation modal (replaces window.confirm) ──────────────────────
function ConfirmModal({ title, message, confirmLabel = 'Confirm', danger = false, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[102] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 text-left animate-enter">
      <div className={`glass-card p-10 max-w-lg w-full shadow-2xl border-t-8 ${danger ? 'border-red-600' : 'border-cyan-500'}`}>
        <div className="flex items-start gap-4 mb-8">
          <div className={`p-3 rounded-2xl ${danger ? 'bg-red-500/20 text-red-500' : 'bg-indigo-600/20 text-indigo-600'}`}>
            <AlertTriangle className="h-8 w-8 shrink-0" />
          </div>
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h3>
            <p className="text-sm text-slate-500 font-medium mt-2 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex gap-4 mt-10 justify-end">
          <button onClick={onCancel} className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-all">
            Cancel
          </button>
          <button onClick={onConfirm} className={`px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest text-white transition-all ${danger ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20' : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20'}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Create User Modal (Provisioning Engine) ──────────────────────────────────
function CreateUserModal({ onClose, onSuccess }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'bank' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/admin/users', formData);
      toast({ type: 'success', message: `User ${formData.email} created successfully.` });
      onSuccess();
      onClose();
    } catch (err) {
      toast({ type: 'error', message: err.response?.data?.detail || 'Failed to create user.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[102] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 animate-enter">
      <div className="glass-card max-w-xl w-full p-12 relative border-t-8 border-indigo-600 bg-white dark:bg-slate-900 shadow-3xl">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-all text-slate-400">
          <X className="h-6 w-6" />
        </button>

        <div className="mb-10">
           <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">User Management</p>
           <h2 className="text-3xl font-bold tracking-tight flex items-center gap-4 text-slate-900 dark:text-white">
              <UserPlus className="text-indigo-600 h-8 w-8" /> Create New User
           </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 block">Full Name</label>
                <div className="relative group">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-indigo-600 transition-colors" />
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input-field pl-12" placeholder="John Doe" />
                </div>
            </div>

            <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 block">Email Address</label>
                <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-indigo-600 transition-colors" />
                    <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="input-field pl-12" placeholder="name@company.com" />
                </div>
            </div>

            <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 block">Password</label>
                <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-indigo-600 transition-colors" />
                    <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="input-field pl-12" placeholder="••••••••••••" />
                </div>
            </div>

            <div className="md:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 block">User Role</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-5 py-4 text-sm font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none text-slate-900 dark:text-white">
                  <option value="bank" className="bg-white dark:bg-slate-900">🏦 Bank Agent</option>
                  <option value="gov"  className="bg-white dark:bg-slate-900">⚖️ Audit Agent</option>
                </select>
            </div>
          </div>

          <button disabled={loading} type="submit" className="btn-primary w-full py-5 text-sm tracking-widest shadow-indigo-500/20">
            {loading ? 'RESERVING...' : 'CREATE USER'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Admin() {
  const toast = useToast();

  const [activeTab, setActiveTab]   = useState('users');
  const [data, setData]             = useState({ users: [], logs: [], predictions: [] });
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(true);
  const [confirm, setConfirm]       = useState(null); 
  const [isAddingUser, setIsAddingUser] = useState(false);

  const showConfirm = (opts) => setConfirm(opts);
  const hideConfirm = () => setConfirm(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [u, l, p] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/logs'),
        api.get('/admin/db/predictions'),
      ]);
      setData({ users: u.data, logs: l.data, predictions: p.data });
    } catch {
      setError('ACCESS DENIED: Insufficient administrative clearance for this operation.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAdminData(); }, []);

  const handleDelete = (table, id) => {
    showConfirm({
      title:        `DESTRUCT: ID-${id}`,
      message:      `Proceed with permanent deletion of index ${id} from the ${table.toUpperCase()} array?`,
      confirmLabel: 'DESTRUCT',
      danger:       true,
      onConfirm:    async () => {
        hideConfirm();
        try {
          await api.delete(`/admin/db/${table}/${id}`);
          toast({ type: 'success', message: `Index #${id} purged from ${table}.` });
          fetchAdminData();
        } catch {
          toast({ type: 'error', message: 'Purge operation failed.' });
        }
      },
    });
  };

  const handleToggleAccess = async (id, currentStatus) => {
    try {
      await api.post(`/admin/users/${id}/toggle`);
      toast({ type: 'info', message: `User #${id} ${currentStatus ? 'Deactivated' : 'Activated'}.` });
      fetchAdminData();
    } catch {
      toast({ type: 'error', message: 'Failed to update user status.' });
    }
  };

  const handleNuke = () => {
    showConfirm({
      title:        '⚠️ Clear All Database Records',
      message:      'This will delete all historical data, user logs, and prediction entries. This action cannot be undone.',
      confirmLabel: 'Delete All Data',
      danger:       true,
      onConfirm:    async () => {
        hideConfirm();
        try {
          const res = await api.post('/admin/db/nuke');
          toast({ type: 'warning', message: res.data.message });
          fetchAdminData();
        } catch {
          toast({ type: 'error', message: 'Failed to clear database.' });
        }
      },
    });
  };

  if (error) return (
    <div className="p-20 text-center text-red-600 font-black animate-enter flex flex-col items-center">
      <div className="p-6 bg-red-600/10 rounded-full mb-8 border border-red-600/20 shadow-lg shadow-red-600/10">
        <ShieldAlert className="h-16 w-16" />
      </div>
      <h1 className="text-3xl uppercase tracking-tighter mb-4">Clearance Verification Failure</h1>
      <p className="text-slate-500 max-w-md uppercase tracking-widest text-xs italic">{error}</p>
    </div>
  );

  return (
    <div className="animate-enter space-y-10">
      {/* Modals */}
      {confirm && (
        <ConfirmModal
          title={confirm.title}
          message={confirm.message}
          confirmLabel={confirm.confirmLabel}
          danger={confirm.danger}
          onConfirm={confirm.onConfirm}
          onCancel={hideConfirm}
        />
      )}
      {isAddingUser && <CreateUserModal onClose={() => setIsAddingUser(false)} onSuccess={fetchAdminData} />}

      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
           <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">System Administration</p>
           <h1 className="text-4xl font-bold tracking-tight flex items-center gap-4 text-slate-900 dark:text-white">
              <Database className="text-indigo-600 h-8 w-8" /> Admin Panel
           </h1>
        </div>
        <div className="flex gap-4">
            <button onClick={fetchAdminData} className="px-5 py-3 flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-500 hover:text-indigo-600 transition-all font-bold text-[10px] uppercase tracking-widest">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Sync Data
            </button>
            {activeTab === 'users' && (
                <button onClick={() => setIsAddingUser(true)} className="px-6 py-3 flex items-center bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-500/20">
                    <UserPlus className="h-4 w-4 mr-2" /> Add New User
                </button>
            )}
        </div>
      </div>

      {/* Controller Navigation */}
      <div className="flex space-x-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-white/5 w-fit">
        {['users', 'predictions', 'logs'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 font-bold uppercase tracking-widest text-[10px] rounded-xl transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>
            {tab}
          </button>
        ))}
        <button onClick={() => setActiveTab('danger')}
          className={`px-6 py-2.5 font-black uppercase tracking-widest text-[10px] rounded-xl transition-all ${activeTab === 'danger' ? 'bg-red-600 text-white shadow-lg' : 'text-red-500/60 hover:text-red-500 hover:bg-red-500/5'}`}>
          Danger Zone
        </button>
      </div>

      {loading ? (
        <div className="p-32 text-center text-slate-400 font-bold uppercase tracking-widest animate-pulse">Loading System Data...</div>
      ) : (
        <div className="glass-card overflow-hidden border-t-4 border-indigo-600">

          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/50 sticky top-0 border-b border-slate-200 dark:border-white/10">
                  <tr className="uppercase font-bold text-[10px] tracking-widest text-slate-500">
                    <th className="p-5">User ID</th>
                    <th className="p-5">Email Address</th>
                    <th className="p-5">Full Name</th>
                    <th className="p-5">Role</th>
                    <th className="p-5">Status</th>
                    <th className="p-5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="font-medium">
                  {data.users.map(u => (
                    <tr key={u.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition">
                      <td className="p-5 font-mono text-indigo-600 text-xs">{String(u.id).padStart(4, '0')}</td>
                      <td className="p-5 sensitive-data font-mono text-xs text-slate-400">{u.email}</td>
                      <td className="p-5 text-sm sensitive-data">{u.name}</td>
                      <td className="p-5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${u.role === 'admin' ? 'border-indigo-500/30 text-indigo-600' : u.role === 'gov' ? 'border-emerald-500/30 text-emerald-500' : 'border-slate-300 text-slate-500'}`}>
                              {u.role}
                          </span>
                      </td>
                      <td className="p-5">
                          {u.is_active ? 
                            <span className="text-emerald-600 text-[10px] uppercase font-bold tracking-widest flex items-center gap-2">Active</span> : 
                            <span className="text-red-500 text-[10px] uppercase font-bold tracking-widest flex items-center gap-2">Inactive</span>
                          }
                      </td>
                      <td className="p-5 flex justify-center gap-3">
                        {u.role !== 'admin' && (
                          <button onClick={() => handleToggleAccess(u.id, u.is_active)} className={`px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all border ${u.is_active ? 'border-red-500/30 text-red-500 hover:bg-red-500/10' : 'border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10'}`}>
                            {u.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                        <button onClick={() => handleDelete('users', u.id)} className="p-2 text-slate-700 hover:text-red-500 transition-all" title="Purge Record">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'predictions' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/50 sticky top-0 border-b border-slate-200 dark:border-white/10">
                  <tr className="uppercase font-bold text-[10px] tracking-widest text-slate-500">
                    <th className="p-5">ID</th>
                    <th className="p-5">Age</th>
                    <th className="p-5">Education</th>
                    <th className="p-5">Hours</th>
                    <th className="p-5">Result</th>
                    <th className="p-5">Status</th>
                    <th className="p-5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="font-medium">
                  {data.predictions.map(p => (
                    <tr key={p.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition">
                      <td className="p-5 font-mono text-indigo-600 text-xs">{String(p.id).padStart(6, '0')}</td>
                      <td className="p-5 font-mono text-xs text-slate-500">{p.age}</td>
                      <td className="p-5 text-[10px] uppercase truncate max-w-[150px]">{p.education}</td>
                      <td className="p-5 text-sm">{p.hours_per_week}h</td>
                      <td className="p-5 font-bold text-indigo-600">{p.prediction}</td>
                      <td className="p-5">
                          <span className={`text-[10px] font-bold uppercase ${p.risk_level === 'High' ? 'text-red-600' : 'text-emerald-600'}`}>
                            {p.risk_level}
                          </span>
                      </td>
                      <td className="p-5 text-center">
                        <button onClick={() => handleDelete('predictions', p.id)} className="p-2 text-slate-700 hover:text-red-500 transition-all">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/50 sticky top-0 border-b border-slate-200 dark:border-white/10">
                  <tr className="uppercase font-bold text-[10px] tracking-widest text-slate-500">
                    <th className="p-5">Log ID</th>
                    <th className="p-5">API Endpoint</th>
                    <th className="p-5">Status</th>
                    <th className="p-5">Latency</th>
                    <th className="p-5">Date/Time</th>
                  </tr>
                </thead>
                <tbody className="font-medium">
                  {data.logs.map(l => (
                    <tr key={l.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition">
                      <td className="p-5 font-mono text-indigo-600 text-xs">{String(l.id).padStart(8, '0')}</td>
                      <td className="p-5 font-mono text-[10px] text-slate-400 truncate max-w-xs">{l.api_call}</td>
                      <td className="p-5 uppercase font-bold text-[10px] text-emerald-600 flex items-center gap-2">{l.status}</td>
                      <td className="p-5 font-mono text-[10px] text-slate-500">{l.response_time?.toFixed(0)}ms</td>
                      <td className="p-5 text-[10px] text-slate-500 font-mono italic">{new Date(l.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'danger' && (
            <div className="p-24 text-center flex flex-col items-center animate-enter">
              <div className="relative mb-12">
                  <ShieldAlert className="h-20 w-20 text-red-500" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-red-500 mb-2">High Risk Operation</p>
              <h2 className="text-3xl font-bold mb-4 tracking-tight text-slate-900 dark:text-white">Clear All Database Records</h2>
              <p className="text-slate-500 max-w-lg mb-12 font-medium text-sm leading-relaxed">
                This process will permanently delete all prediction data, logs, and historical entries. 
                <span className="text-red-500 font-bold block mt-2">THIS ACTION CANNOT BE UNDONE.</span>
              </p>
              <button onClick={handleNuke}
                className="px-10 py-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-red-500/20 active:scale-95 transition-all flex items-center gap-3">
                <Trash2 className="h-4 w-4" /> Delete All Data
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
