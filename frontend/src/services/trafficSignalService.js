import apiClient from './apiClient';
export const scheduleTrafficSignal = () => apiClient.post('/schedule');
