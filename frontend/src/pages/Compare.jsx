import { useState } from 'react';
import api from '../services/api';
import { GitCompare } from 'lucide-react';

function PredictForm({ onResult, id }) {
  const [formData, setFormData] = useState({
    age: 30, workclass: 'Private', education: 'Bachelors', occupation: 'Exec-managerial', hours_per_week: 40
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/predict/', { ...formData, age: parseInt(formData.age), hours_per_week: parseInt(formData.hours_per_week) });
      onResult(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 border-b border-gray-200 dark:border-gray-700 space-y-4">
      <h3 className="font-bold text-lg mb-4 text-indigo-600">Profile {id}</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="text-xs mb-1 block">Age</label><input type="number" onChange={(e)=>setFormData({...formData, age: e.target.value})} value={formData.age} className="w-full text-sm p-2 rounded bg-gray-50 dark:bg-gray-800 outline-none" /></div>
        <div><label className="text-xs mb-1 block">Hours</label><input type="number" onChange={(e)=>setFormData({...formData, hours_per_week: e.target.value})} value={formData.hours_per_week} className="w-full text-sm p-2 rounded bg-gray-50 dark:bg-gray-800 outline-none" /></div>
        <div className="col-span-2">
          <label className="text-xs mb-1 block">Education</label>
          <select onChange={(e)=>setFormData({...formData, education: e.target.value})} value={formData.education} className="w-full text-sm p-2 rounded bg-gray-50 dark:bg-gray-800 outline-none">
            <option>Bachelors</option><option>Masters</option><option>HS-grad</option><option>Doctorate</option>
          </select>
        </div>
      </div>
      <button type="submit" className="w-full text-sm py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/20">Predict Profile {id}</button>
    </form>
  );
}

export default function Compare() {
  const [result1, setResult1] = useState(null);
  const [result2, setResult2] = useState(null);

  return (
    <div className="animate-fade-in">
      <h1 className="text-4xl font-bold tracking-tight mb-8 flex items-center text-slate-900 dark:text-white"><GitCompare className="mr-3 text-indigo-600" /> Profile Comparison</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card shadow-lg flex flex-col">
          <PredictForm id="A" onResult={setResult1} />
          {result1 && (
             <div className="p-6 flex-1 flex flex-col justify-center items-center text-center">
                 <p className="text-sm opacity-70">Prediction</p>
                 <p className={`text-3xl font-bold ${result1.prediction === '>50K' ? 'text-emerald-500' : 'text-orange-500'}`}>{result1.prediction}</p>
                 <p className="mt-4 text-sm opacity-70">Risk Level</p>
                 <p className="text-xl font-bold">{result1.risk_level}</p>
                 <p className="mt-4 text-sm opacity-70">Approved Amount</p>
                 <p className="text-2xl">${result1.loan_amount.toLocaleString()}</p>
             </div>
          )}
        </div>

        <div className="glass-card shadow-lg flex flex-col">
          <PredictForm id="B" onResult={setResult2} />
          {result2 && (
             <div className="p-6 flex-1 flex flex-col justify-center items-center text-center">
                 <p className="text-sm opacity-70">Prediction</p>
                 <p className={`text-3xl font-bold ${result2.prediction === '>50K' ? 'text-emerald-500' : 'text-orange-500'}`}>{result2.prediction}</p>
                 <p className="mt-4 text-sm opacity-70">Risk Level</p>
                 <p className="text-xl font-bold">{result2.risk_level}</p>
                 <p className="mt-4 text-sm opacity-70">Approved Amount</p>
                 <p className="text-2xl">${result2.loan_amount.toLocaleString()}</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
