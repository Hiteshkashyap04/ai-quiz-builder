import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { login as apiLogin, register as apiRegister, getMe as apiGetMe, updateProfile as apiUpdateProfile } from './auth'
import apiClient from './apiClient' // <--- This must match the filename exactly!

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const setupAuth = useCallback((accessToken) => {
    setToken(accessToken);
    localStorage.setItem('token', accessToken);
    // We don't need to set the header here because apiClient interceptor handles it,
    // but updating the state triggers re-renders.
    setIsAuthenticated(true);
  }, []);

  const loadUser = useCallback(async () => {
    if (token) {
      try {
        // setupAuth(token); 
        const { data } = await apiGetMe();
        setUser(data);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to fetch user', error);
        logout();
      }
    }
    setIsLoading(false);
  }, [token]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (credentials) => {
    const { data } = await apiLogin(credentials)
    setupAuth(data.access_token);
    await loadUser();
    return data;
  }

  const register = async (userData) => {
    const { data } = await apiRegister(userData)
    return data;
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    setIsAuthenticated(false)
  }

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}