import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
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

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    }
    return Promise.reject(error);
  }
);

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);

// Routes
export const optimizeRoute = (data) => api.post('/routes/optimize', data);
export const createRoute = (data) => api.post('/routes', data);
export const getRoutes = (params) => api.get('/routes', { params });
export const getRouteById = (id) => api.get(`/routes/${id}`);
export const updateRoute = (id, data) => api.put(`/routes/${id}`, data);
export const deleteRoute = (id) => api.delete(`/routes/${id}`);
export const executeRoute = (id) => api.post(`/routes/${id}/execute`);

// Vehicles
export const createVehicle = (data) => api.post('/vehicles', data);
export const getVehicles = () => api.get('/vehicles');
export const getVehicleById = (id) => api.get(`/vehicles/${id}`);
export const updateVehicle = (id, data) => api.put(`/vehicles/${id}`, data);
export const deleteVehicle = (id) => api.delete(`/vehicles/${id}`);

// Deliveries
export const getDeliveries = (params) => api.get('/deliveries', { params });
export const createDelivery = (data) => api.post('/deliveries', data);
export const getDeliveryById = (id) => api.get(`/deliveries/${id}`);
export const updateDelivery = (id, data) => api.put(`/deliveries/${id}`, data);
export const deleteDelivery = (id) => api.delete(`/deliveries/${id}`);

// Analytics
export const getDashboardData = () => api.get('/analytics/dashboard');
export const getMetrics = () => api.get('/analytics/metrics');
export const getPerformance = () => api.get('/analytics/performance');

export default api;