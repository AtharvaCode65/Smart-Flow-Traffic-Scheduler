import apiClient from './apiClient';
export const addVehicle = (vehicle) => apiClient.post('/vehicles', vehicle);
