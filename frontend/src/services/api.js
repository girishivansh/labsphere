import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login:  (data) => api.post('/auth/login', data),
  getMe:  ()     => api.get('/auth/me'),
};

export const itemsAPI = {
  getAll:      (params) => api.get('/items', { params }),
  getById:     (id)     => api.get(`/items/${id}`),
  create:      (data)   => api.post('/items', data),
  update:      (id, data) => api.put(`/items/${id}`, data),
  delete:      (id)     => api.delete(`/items/${id}`),
  getLowStock: ()       => api.get('/items/low-stock'),
};

export const issuesAPI = {
  getAll:  (params) => api.get('/issues', { params }),
  create:  (data)   => api.post('/issues', data),
  getToday: ()      => api.get('/issues/today'),
};

export const returnsAPI = {
  getAll:    (params) => api.get('/returns', { params }),
  create:    (data)   => api.post('/returns', data),
  getRecent: ()       => api.get('/returns/recent'),
};

export const reportsAPI = {
  getDashboard: ()       => api.get('/reports/dashboard'),
  getDaily:     (params) => api.get('/reports/daily', { params }),
  getMonthly:   (params) => api.get('/reports/monthly', { params }),
  getDamage:    (params) => api.get('/reports/damage', { params }),
  getLowStock:  ()       => api.get('/reports/low-stock'),
};

export const usersAPI = {
  getAll:         ()         => api.get('/users'),
  create:         (data)     => api.post('/users', data),
  update:         (id, data) => api.put(`/users/${id}`, data),
  delete:         (id)       => api.delete(`/users/${id}`),
  changePassword: (data)     => api.put('/users/change-password', data),
};

export default api;
