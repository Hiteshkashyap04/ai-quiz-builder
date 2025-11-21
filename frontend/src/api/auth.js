import apiClient from './apiClient';

export const login = async (credentials) => {
  return apiClient.post('/auth/login', credentials);
};

export const register = async (userData) => {
  return apiClient.post('/auth/register', userData);
};

export const getMe = async () => {
  return apiClient.get('/users/me');
};

// --- NEW FUNCTION ---
export const updateProfile = async (data) => {
  // data = { full_name: "...", avatar: "..." }
  return apiClient.put('/users/me', data);
};