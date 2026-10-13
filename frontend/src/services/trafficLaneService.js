import apiClient from './apiClient';
export const getTrafficStatus = () => apiClient.get('/status');
