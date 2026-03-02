import axios from 'axios';

const API_BASE = 'http://localhost:4000/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

// ✅ REQUEST INTERCEPTOR - ADD TOKEN
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  console.log('📤 Request to', config.url, 'Token:', token ? '✓' : '✗')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
});

// ✅ RESPONSE INTERCEPTOR - HANDLE 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('🔓 401 Unauthorized - clearing token')
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
);

// ✅ SINGLE API EXPORT - ALL METHODS HERE
export const api = {
  // Generic HTTP methods
  get: (url) => apiClient.get(url),
  post: (url, data) => apiClient.post(url, data),
  patch: (url, data) => apiClient.patch(url, data),
  delete: (url) => apiClient.delete(url),

  // ========== Auth ==========
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  register: (data) => apiClient.post('/auth/register', data),
  getMe: () => apiClient.get('/auth/me').catch(() => ({ data: null })),

  // ========== Products ==========
  getProducts: () => apiClient.get('/products'),
  createProduct: (data) => apiClient.post('/products', data),
  updateProduct: (id, data) => apiClient.patch(`/products/${id}`, data),
  deleteProduct: (id) => apiClient.delete(`/products/${id}`),

  // ========== Orders ==========
  getOrders: () => apiClient.get('/orders'),
  createOrder: (data) => apiClient.post('/orders', data),
  getOrderById: (id) => apiClient.get(`/orders/${id}`),

  // ========== Payments ==========
  createPaymentIntent: (data) => apiClient.post('/payments/intent', data),
  confirmPayment: (data) => apiClient.post('/payments/confirm', data),

  // ========== Admin - Stats & Analytics ==========
  getStats: () => apiClient.get('/admin/stats'),
  getAllOrders: () => apiClient.get('/admin/orders'),
  getAllUsers: () => apiClient.get('/admin/users'),
  getAdminProducts: () => apiClient.get('/admin/products'),
  updateOrderStatus: (id, status) => apiClient.patch(`/admin/orders/${id}/status`, { status }),
  deleteUser: (id) => apiClient.delete(`/admin/users/${id}`),

  // ========== Notifications ==========
  getNotifications: () => apiClient.get('/notifications').catch(() => ({ data: [] })),
  markNotificationRead: (id) => apiClient.patch(`/notifications/${id}/read`),

  // ========== Reservations ==========
  createReservation: (data) => apiClient.post('/reservations', data),
  getReservations: () => apiClient.get('/reservations'),
  updateReservation: (id, data) => apiClient.patch(`/reservations/${id}`, data),
  deleteReservation: (id) => apiClient.delete(`/reservations/${id}`)
};

export const updateOrderStatus = (orderId, status) =>
  apiClient.patch(`/admin/orders/${orderId}/status`, { status })

export const updateReservationStatus = (reservationId, status) =>
  apiClient.patch(`/admin/reservations/${reservationId}/status`, { status })

export default api;