import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('soopi_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('soopi_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('soopi_token');
      if (storedToken) {
        try {
          const res = await api.getProfile();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('soopi_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('Session expired or invalid, logging out:', err.message);
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('soopi_token', res.token);
      localStorage.setItem('soopi_user', JSON.stringify(res.user));
      return res.user;
    }
    throw new Error(res.message || 'Đăng nhập không thành công');
  };

  const register = async (data) => {
    const res = await api.register(data);
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('soopi_token', res.token);
      localStorage.setItem('soopi_user', JSON.stringify(res.user));
      return res.user;
    }
    throw new Error(res.message || 'Đăng ký không thành công');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('soopi_token');
    localStorage.removeItem('soopi_user');
  };

  const updateProfile = async (data) => {
    const res = await api.updateProfile(data);
    if (res.success && res.user) {
      setUser(res.user);
      localStorage.setItem('soopi_user', JSON.stringify(res.user));
      return res.user;
    }
    throw new Error(res.message || 'Cập nhật thất bại');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

