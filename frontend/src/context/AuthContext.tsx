'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { api } from '@/lib/api';

export interface User {
  id: number;
  name: string;
  email: string;
  balance: number;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = api.getToken();
      if (token) {
        try {
          const response = await api.getUser();
          if (response.data.success && response.data.data) {
            setUser(response.data.data);
          } else {
            api.clearToken();
          }
        } catch {
          api.clearToken();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // Sesi kedaluwarsa (401) dibroadcast oleh ApiClient; guard halaman yang mengarahkan ke /login.
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.login({ email, password });
    if (response.data.success && response.data.data) {
      api.setToken(response.data.data.token);
      setUser(response.data.data.user);
    } else {
      throw new Error(response.data.message ?? 'Login gagal');
    }
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await api.register({ name, email, password });
    if (response.data.success && response.data.data) {
      api.setToken(response.data.data.token);
      setUser(response.data.data.user);
    } else {
      throw new Error(response.data.message ?? 'Registrasi gagal');
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      api.clearToken();
      setUser(null);
    }
  };

  const refreshUser = async () => {
    if (!api.isAuthenticated()) return;
    try {
      const response = await api.getUser();
      if (response.data.success && response.data.data) {
        setUser(response.data.data);
      }
    } catch {
      api.clearToken();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
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