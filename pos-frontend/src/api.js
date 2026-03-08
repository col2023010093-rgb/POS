import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_BASE
});

// ✅ Add token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Handle 401 responses (expired token)
// Never redirect for /auth/ requests (login, register, verify, etc.)
// so that wrong password doesn't cause a page refresh
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status      = error.response?.status;
    const requestUrl  = error.config?.url || '';
    const isAuthReq   = requestUrl.includes('/auth/');
    const onLoginPage = window.location.href.includes('/login');

    if (status === 401 && !isAuthReq && !onLoginPage) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;