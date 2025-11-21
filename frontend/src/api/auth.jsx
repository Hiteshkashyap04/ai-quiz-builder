import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
// IMPORT from the new specific API file to avoid circular dependency
import { 
  login as apiLogin, 
  register as apiRegister, 
  getMe as apiGetMe, 
  updateProfile as apiUpdateProfile 
} from './auth-api';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const response = await apiGetMe();
      // Adjust this based on whether your API returns { data: user } or just user
      setUser(response.data || response); 
    } catch (error) {
      console.error("Failed to fetch user", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (data) => {
    const response = await apiLogin(data);
    await fetchUser();
    return response;
  };

  const register = async (data) => {
    const response = await apiRegister(data);
    await fetchUser();
    return response;
  };

  const logout = () => {
    setUser(null);
    // If you store tokens in localStorage, remove them here:
    // localStorage.removeItem('token');
    window.location.href = '/login'; 
  };

  const updateProfile = async (data) => {
    const response = await apiUpdateProfile(data);
    await fetchUser();
    return response;
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};