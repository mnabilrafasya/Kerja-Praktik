import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData)
};

export const suratAPI = {
  getAll: (params) => api.get('/surat', { params }),
  getById: (id) => api.get(`/surat/${id}`),
  create: (formData) => api.post('/surat', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, formData) => api.put(`/surat/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/surat/${id}`)
};

export const unitAPI = {
  getAll: () => api.get('/unit'),
  create: (data) => api.post('/unit', data),
  update: (id, data) => api.put(`/unit/${id}`, data),
  delete: (id) => api.delete(`/unit/${id}`)
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats')
};

export default api;