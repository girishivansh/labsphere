import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({ baseURL: `${API_URL}/api` });

// Attach JWT to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('labsphere-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('labsphere-token');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// ── Auth ─────────────────────────────────────────────────────────────
export const authAPI = {
  signup:         (data) => api.post('/auth/signup', data),
  verifyOtp:      (data) => api.post('/auth/verify-otp', data),
  resendOtp:      (data) => api.post('/auth/resend-otp', data),
  login:          (data) => api.post('/auth/login', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword:  (data) => api.post('/auth/reset-password', data),
  getInviteInfo:  (token) => api.get(`/auth/invite/${token}`),
  acceptInvite:   (token, data) => api.post(`/auth/accept-invite/${token}`, data),
  getMe:          () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// ── Institutes (Super Admin) ─────────────────────────────────────────
export const institutesAPI = {
  getAll:         (params) => api.get('/institutes', { params }),
  getById:        (id)     => api.get(`/institutes/${id}`),
  updateStatus:   (id, data) => api.put(`/institutes/${id}/status`, data),
  delete:         (id)     => api.delete(`/institutes/${id}`),
  getStats:       ()       => api.get('/institutes/stats'),
};

// ── Members (Institute Admin) ────────────────────────────────────────
export const membersAPI = {
  getAll:          (params) => api.get('/members', { params }),
  add:             (data)   => api.post('/members', data),
  invite:          (data)   => api.post('/members/invite', data),
  update:          (id, data) => api.put(`/members/${id}`, data),
  toggleStatus:    (id)     => api.put(`/members/${id}/toggle-status`),
  resetPassword:   (id, data) => api.put(`/members/${id}/reset-password`, data),
  delete:          (id)     => api.delete(`/members/${id}`),
};

// ── Items ────────────────────────────────────────────────────────────
export const itemsAPI = {
  getAll:  (params) => api.get('/items', { params }),
  getById: (id)     => api.get(`/items/${id}`),
  create:  (data)   => api.post('/items', data),
  update:  (id, data) => api.put(`/items/${id}`, data),
  delete:  (id)     => api.delete(`/items/${id}`),
};

// ── Issues ───────────────────────────────────────────────────────────
export const issuesAPI = {
  getAll:  (params) => api.get('/issues', { params }),
  create:  (data)   => api.post('/issues', data),
  getToday:()       => api.get('/issues/today'),
};

// ── Returns ──────────────────────────────────────────────────────────
export const returnsAPI = {
  getAll:  (params) => api.get('/returns', { params }),
  create:  (data)   => api.post('/returns', data),
};

// ── Reports ──────────────────────────────────────────────────────────
export const reportsAPI = {
  getDashboard: () => api.get('/reports/dashboard'),
  getDaily:     (params) => api.get('/reports/daily', { params }),
  getMonthly:   (params) => api.get('/reports/monthly', { params }),
  getDamage:    (params) => api.get('/reports/damage', { params }),
  getLowStock:  () => api.get('/reports/low-stock'),
};

export default api;
