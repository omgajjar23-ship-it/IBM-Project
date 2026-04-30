import axios from 'axios';

// Dynamically determine the backend URL based on how the frontend is accessed
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    return `http://${host}:8000/api/v1`;
  }
  return 'http://127.0.0.1:8000/api/v1';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Response interceptor to handle authentication failures
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear local storage if token/cookie is rejected
      localStorage.removeItem('role');
      localStorage.removeItem('userEmail');
      // We don't force redirect here to avoid looping, but we clear the indicators
    }
    return Promise.reject(error);
  }
);

// ── Role helpers (Token is now stored in HttpOnly cookies secure from XSS) ──
export const setRole      = (role)  => localStorage.setItem('role', role);
export const getRole      = ()      => localStorage.getItem('role');
export const getToken     = ()      => localStorage.getItem('role'); // Indicator since token is in cookie
export const setUserEmail = (email) => localStorage.setItem('userEmail', email);
export const getUserEmail = ()      => localStorage.getItem('userEmail');

export const clearToken = async () => {
  try {
    await api.post('/auth/logout');
  } catch(e) {}
  localStorage.removeItem('role');
  localStorage.removeItem('userEmail');
};

export default api;
