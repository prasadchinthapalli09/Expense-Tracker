// ===== client/src/context/AuthContext.jsx =====
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios.js';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setErrorState] = useState(null);

  useEffect(() => {
    // Load existing credentials from localStorage on startup
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const setError = (msg) => {
    setErrorState(msg);
  };

  const register = async (name, email, password) => {
    setLoading(true);
    setErrorState(null);
    try {
      const response = await api.post('/auth/register', { name, email, password });
      const { token: receivedToken, user: receivedUser } = response.data;
      
      localStorage.setItem('token', receivedToken);
      localStorage.setItem('user', JSON.stringify(receivedUser));
      
      setToken(receivedToken);
      setUser(receivedUser);
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Registration failed. Please try again.';
      setErrorState(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    setErrorState(null);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: receivedToken, user: receivedUser } = response.data;

      localStorage.setItem('token', receivedToken);
      localStorage.setItem('user', JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Login failed. Please verify credentials.';
      setErrorState(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const [currency, setCurrencyState] = useState(() => {
    const saved = localStorage.getItem('currency_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback below
      }
    }
    return { code: 'INR', symbol: '₹', locale: 'en-IN', name: 'Indian Rupee (₹)' };
  });

  const updateCurrency = (config) => {
    localStorage.setItem('currency_config', JSON.stringify(config));
    setCurrencyState(config);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser, // Let components update the user object (e.g. budgets) locally if needed
        token,
        loading,
        register,
        login,
        logout,
        error,
        setError,
        currency,
        updateCurrency,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
