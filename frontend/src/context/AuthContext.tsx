import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../types';
import { apiClient } from '../api/client';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Restore session
    const savedToken = localStorage.getItem('retailpulse_token');
    const savedUser = localStorage.getItem('retailpulse_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('retailpulse_token');
        localStorage.removeItem('retailpulse_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      const { access_token, user: loggedUser } = res.data;
      setToken(access_token);
      setUser(loggedUser);
      localStorage.setItem('retailpulse_token', access_token);
      localStorage.setItem('retailpulse_user', JSON.stringify(loggedUser));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: string = 'ANALYST') => {
    setIsLoading(true);
    try {
      const res = await apiClient.post('/auth/register', {
        full_name: name,
        email,
        password,
        role
      });
      const { access_token, user: newUser } = res.data;
      setToken(access_token);
      setUser(newUser);
      localStorage.setItem('retailpulse_token', access_token);
      localStorage.setItem('retailpulse_user', JSON.stringify(newUser));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('retailpulse_token');
    localStorage.removeItem('retailpulse_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
