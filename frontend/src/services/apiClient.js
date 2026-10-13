import axios from 'axios';
import { API_TIMEOUT_MS } from '../constants/traffic';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: API_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(new Error(error.response?.data?.error || error.message || 'The traffic server is unavailable.')),
);

export default apiClient;
