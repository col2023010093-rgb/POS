import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
export const IMAGE_BASE_URL = API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// ✅ REQUEST INTERCEPTOR - ADD TOKEN
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('📤 Request to', config.url, 'Token:', token ? '✓' : '✗');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ RESPONSE INTERCEPTOR - HANDLE 401
// Only redirect to /login if:
//   1. The response is 401
//   2. The request was NOT the login endpoint itself (wrong password should NOT redirect)
//   3. We are NOT already on the /login page
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status     = error.response?.status;
    const requestUrl = error.config?.url || '';

    // Never redirect for ANY /auth/ request — covers login, register, verify, resend
    const isAuthReq   = requestUrl.includes('/auth/');
    // Support both path-based (/login) and hash-based (#/login) routing
    const onLoginPage = window.location.href.includes('/login');

    // Save to localStorage so we can read it AFTER a page refresh
    const debugInfo = { status, requestUrl, isAuthReq, onLoginPage, time: new Date().toISOString() };
    localStorage.setItem('last_interceptor_hit', JSON.stringify(debugInfo));

    if (status === 401 && !isAuthReq && !onLoginPage) {
      console.warn('🔓 Session expired — redirecting to login');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export const api = {
  // Generic HTTP methods
  get:    (url)               => apiClient.get(url),
  post:   (url, data, config) => apiClient.post(url, data, config),
  patch:  (url, data, config) => apiClient.patch(url, data, config),
  delete: (url)               => apiClient.delete(url),

  // ========== Auth ==========
  login:    (email, password) => apiClient.post('/auth/login', { email, password }),
  register: (data)            => apiClient.post('/auth/register', data),
  getMe:    ()                => apiClient.get('/auth/me').catch(() => ({ data: null })),

  // ========== Products ==========
  getProducts:   ()          => apiClient.get('/api/products'),
  createProduct: (data)      => apiClient.post('/api/products', data),
  updateProduct: (id, data)  => apiClient.patch(`/api/products/${id}`, data),
  deleteProduct: (id)        => apiClient.delete(`/api/products/${id}`),

  // ========== Orders ==========
  getOrders:    ()     => apiClient.get('/api/orders'),
  createOrder:  (data) => apiClient.post('/api/orders', data),
  getOrderById: (id)   => apiClient.get(`/api/orders/${id}`),

  // ========== Payments ==========
  createPaymentIntent: (data) => apiClient.post('/api/payments/intent', data),
  confirmPayment:      (data) => apiClient.post('/api/payments/confirm', data),

  // ========== Notifications ==========
  getNotifications:     ()   => apiClient.get('/api/notifications').catch(() => ({ data: [] })),
  markNotificationRead: (id) => apiClient.patch(`/api/notifications/${id}/read`),

  // ========== Reservations ==========
  createReservation:  (data)     => apiClient.post('/api/reservations', data),
  getReservations:    ()         => apiClient.get('/api/reservations'),
  updateReservation:  (id, data) => apiClient.patch(`/api/reservations/${id}`, data),
  deleteReservation:  (id)       => apiClient.delete(`/api/reservations/${id}`),

  // ========== Admin ==========
  getStats:                ()            => apiClient.get('/api/admin/stats'),
  getAllOrders:             ()            => apiClient.get('/api/admin/orders'),
  getAllUsers:              ()            => apiClient.get('/api/admin/users'),
  deleteUser:              (id)          => apiClient.delete(`/api/admin/users/${id}`),
  getAdminProducts:        ()            => apiClient.get('/api/admin/products'),
  getAdminReservations:    ()            => apiClient.get('/api/admin/reservations'),
  updateOrderStatus:       (id, status)  => apiClient.patch(`/api/admin/orders/${id}/status`, { status }),
  updateReservationStatus: (id, status)  => apiClient.patch(`/api/admin/reservations/${id}/status`, { status }),
};

export const updateOrderStatus = (orderId, status) =>
  apiClient.patch(`/api/admin/orders/${orderId}/status`, { status });

export const updateReservationStatus = (reservationId, status) =>
  apiClient.patch(`/api/admin/reservations/${reservationId}/status`, { status });

export default api;