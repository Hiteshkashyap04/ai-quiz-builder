import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { login as apiLogin, register as apiRegister, getMe as apiGetMe } from '../api/auth'
import apiClient from '../api/apiClient'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const setupAuth = useCallback((accessToken) => {
    setToken(accessToken);
    localStorage.setItem('token', accessToken);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    setIsAuthenticated(true);
  }, []);

  const loadUser = useCallback(async () => {
    if (token) {
      try {
        setupAuth(token); // Set token in axios headers
        const { data } = await apiGetMe(); // Fetch user info
        setUser(data);
      } catch (error) {
        console.error('Failed to fetch user', error);
        // If token is invalid, log out
        logout();
      }
    }
    setIsLoading(false);
  }, [token, setupAuth]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (credentials) => {
    const { data } = await apiLogin(credentials)
    setupAuth(data.access_token);
    await loadUser(); // Fetch user data after login
    return data;
  }

  const register = async (userData) => {
    const { data } = await apiRegister(userData)
    // You might want to automatically log in the user after registration
    // If so, your backend should return a token here
    // For now, we'll just return the response
    return data;
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    delete apiClient.defaults.headers.common['Authorization']
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

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}