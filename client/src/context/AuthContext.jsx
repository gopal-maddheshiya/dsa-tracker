import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authStorage } from '../lib/authStorage';
import { authApi } from '../api/auth.api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Bootstrap session from stored token
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      const token = authStorage.getToken();
      if (!token) {
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const response = await authApi.getMe();
        if (isMounted && response?.data?.user) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.warn('Session verification failed:', error.message);
        if (error?.status === 401 || error?.status === 403 || error?.response?.status === 401) {
          authStorage.removeToken();
          if (isMounted) {
            setUser(null);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res?.data?.token && res?.data?.user) {
      authStorage.setToken(res.data.token);
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error('Unexpected response format during login');
  }, []);

  const signup = useCallback(async (name, email, password) => {
    const res = await authApi.signup({ name, email, password });
    if (res?.data?.token && res?.data?.user) {
      authStorage.setToken(res.data.token);
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error('Unexpected response format during signup');
  }, []);

  const logout = useCallback(() => {
    authStorage.removeToken();
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
