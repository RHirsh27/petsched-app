import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
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

// Authentication API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  setAuthData: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },
};

// Pets API
export const petsAPI = {
  getAll: () => api.get('/pets'),
  getById: (id) => api.get(`/pets/${id}`),
  create: (petData) => api.post('/pets', petData),
  update: (id, petData) => api.put(`/pets/${id}`, petData),
  delete: (id) => api.delete(`/pets/${id}`),
  uploadPhoto: (id, file) => {
    const formData = new FormData();
    formData.append('photo', file);
    return api.post(`/pets/${id}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Appointments API
export const appointmentsAPI = {
  getAll: () => api.get('/appointments'),
  getById: (id) => api.get(`/appointments/${id}`),
  getByPetId: (petId) => api.get(`/appointments/pet/${petId}`),
  create: (appointmentData) => api.post('/appointments', appointmentData),
  update: (id, appointmentData) => api.put(`/appointments/${id}`, appointmentData),
  delete: (id) => api.delete(`/appointments/${id}`),
};

// File Upload API
export const uploadAPI = {
  uploadPetPhoto: (file) => {
    const formData = new FormData();
    formData.append('photo', file);
    return api.post('/upload/pet-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  uploadPetPhotos: (files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('photos', file);
    });
    return api.post('/upload/pet-photos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deleteFile: (filename) => api.delete(`/upload/${filename}`),
  getFileInfo: (filename) => api.get(`/upload/${filename}/info`),
  getFileUrl: (filename) => `${API_BASE_URL}/uploads/${filename}`,
};

// Payments API
export const paymentsAPI = {
  getPricing: () => api.get('/payments/pricing'),
  createPaymentIntent: (appointment, amount) => api.post('/payments/create-intent', { appointment, amount }),
  confirmPayment: (paymentIntentId) => api.post('/payments/confirm', { paymentIntentId }),
  createCustomer: (userData) => api.post('/payments/create-customer', { userData }),
  getPaymentMethods: (customerId) => api.get(`/payments/payment-methods/${customerId}`),
  createRefund: (paymentIntentId, amount) => api.post('/payments/refund', { paymentIntentId, amount }),
  calculateCost: (serviceType, duration) => api.post('/payments/calculate-cost', { serviceType, duration }),
};

// Health check
export const healthCheck = () => api.get('/health');

export default api; 