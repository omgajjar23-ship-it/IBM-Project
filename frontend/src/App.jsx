import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import { ToastProvider, useToast } from './components/Toast';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Predict from './pages/Predict';
import History from './pages/History';
import Dashboard from './pages/Dashboard';
import Compare from './pages/Compare';
import Admin from './pages/Admin';
import { getToken, clearToken, getRole } from './services/api';

// ── Route guards ─────────────────────────────────────────────────────────────
function ProtectedRoute({ children, requiredRole }) {
  const token = getToken();
  if (!token) return <Navigate to="/login" replace />;
  if (requiredRole) {
    const role = getRole();
    if (role && role !== requiredRole && role !== 'admin') {
      // Redirect to their home based on role
      return <Navigate to={role === 'gov' ? '/dashboard' : '/predict'} replace />;
    }
  }
  return children;
}

// ── Session timeout — uses toast instead of alert ────────────────────────────
function SessionWatcher() {
  const toast = useToast();
  useEffect(() => {
    let timeoutId;
    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (getToken()) {
          clearToken();
          toast({ type: 'warning', message: 'Session expired due to inactivity. Please log in again.', duration: 6000 });
          setTimeout(() => { window.location.href = '/login'; }, 2000);
        }
      }, 5 * 60 * 1000); // 5 minutes
    };
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keypress', resetTimer);
    resetTimer();
    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keypress', resetTimer);
      clearTimeout(timeoutId);
    };
  }, [toast]);
  return null;
}

function AppContent() {
  const [darkMode, setDarkMode]       = useState(true);
  const [privacyMode, setPrivacyMode] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    document.body.classList.toggle('privacy-mode', privacyMode);
  }, [privacyMode]);

  return (
    <BrowserRouter>
      <SessionWatcher />
      <div className="flex min-h-screen transition-colors duration-300">
        {/* Fixed Sidebar */}
        <Sidebar
          darkMode={darkMode} toggleTheme={() => setDarkMode(!darkMode)}
          privacyMode={privacyMode} togglePrivacy={() => setPrivacyMode(!privacyMode)}
        />
        
        {/* Main Content Area */}
        <main className="flex-1 ml-64 p-8 animate-enter">
          <Routes>
            <Route path="/"          element={<Home />} />
            <Route path="/login"     element={<Login />} />
            <Route path="/register"  element={<Register />} />
            <Route path="/predict"   element={<ProtectedRoute requiredRole="bank"><Predict /></ProtectedRoute>} />
            <Route path="/history"   element={<ProtectedRoute requiredRole="bank"><History /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/compare"   element={<ProtectedRoute requiredRole="bank"><Compare /></ProtectedRoute>} />
            <Route path="/admin"     element={<ProtectedRoute requiredRole="admin"><Admin /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
