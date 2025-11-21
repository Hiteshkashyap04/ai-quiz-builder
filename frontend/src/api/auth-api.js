import apiClient from './apiClient';

// These functions handle the raw API requests
// Adjust the URL paths ('/auth/login', etc.) if your backend uses different routes

export const login = (data) => {
  return apiClient.post('/auth/login', data);
};

export const register = (data) => {
  return apiClient.post('/auth/register', data);
};

export const getMe = () => {
  return apiClient.get('/auth/me');
};

export const updateProfile = (data) => {
  return apiClient.put('/auth/updatedetails', data);
};