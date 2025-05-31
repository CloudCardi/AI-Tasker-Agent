import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
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

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const taskApi = {
  getTasks: () => api.get('/tasks'),
  getTask: (id: string) => api.get(`/tasks/${id}`),
  createTask: (data: any) => api.post('/tasks', data),
  updateTask: (id: string, data: any) => api.put(`/tasks/${id}`, data),
  deleteTask: (id: string) => api.delete(`/tasks/${id}`),
};

export const workflowApi = {
  getWorkflows: () => api.get('/workflows'),
  getWorkflow: (id: string) => api.get(`/workflows/${id}`),
  createWorkflow: (data: any) => api.post('/workflows', data),
  updateWorkflow: (id: string, data: any) => api.put(`/workflows/${id}`, data),
  deleteWorkflow: (id: string) => api.delete(`/workflows/${id}`),
};

export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  register: (userData: any) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh'),
};

export default api;
