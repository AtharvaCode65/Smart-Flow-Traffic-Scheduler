import apiClient from './apiClient';
export const processSelectedLane = () => apiClient.post('/process');
export const resetSimulation = () => apiClient.post('/reset');
