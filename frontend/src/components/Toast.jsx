import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

let _id = 0;
const uid = () => ++_id;

const ICONS = {
  success: '✅',
  error:   '❌',
  warning: '⚠️',
  info:    'ℹ️',
};

const COLORS = {
  success: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/40 text-emerald-300',
  error:   'from-red-500/20    to-red-500/5    border-red-500/40    text-red-300',
  warning: 'from-orange-500/20 to-orange-500/5 border-orange-500/40 text-orange-300',
  info:    'from-cyan-500/20 to-cyan-500/5 border-cyan-500/40 text-cyan-300',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback(({ type = 'info', message, duration = 4000 }) => {
    const id = uid();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => dismiss(id), duration);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border bg-gradient-to-r backdrop-blur-md shadow-xl
              animate-[slideInRight_0.35s_ease-out] ${COLORS[t.type]}`}
          >
            <span className="text-lg mt-0.5 shrink-0">{ICONS[t.type]}</span>
            <p className="text-sm font-medium text-white/90 flex-1 leading-snug">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              className="text-white/50 hover:text-white transition shrink-0 text-lg leading-none"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/** Usage: const toast = useToast(); toast({ type: 'success', message: '...' }); */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
