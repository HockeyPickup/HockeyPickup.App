import axios from 'axios';

declare const __API_URL__: string;

const api = axios.create({
  baseURL: __API_URL__,
  withCredentials: true,
});

console.info('Api Url:', __API_URL__);

// Add request interceptor for auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Only set Content-Type: application/json if we're not sending FormData
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
    }
    return Promise.reject(error);
  },
);

export default api;
