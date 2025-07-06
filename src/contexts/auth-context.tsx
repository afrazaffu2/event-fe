'use client';

import type { User as UserType } from '@/types';
import { useRouter } from 'next/navigation';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { API_ENDPOINTS, createApiRequestOptions } from '@/lib/api';

type AuthContextType = {
  user: UserType | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to parse user from localStorage', error);
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    if (email === 'admin@gmail.com' && pass === 'admin@123') {
      const userData: UserType = { id: 'admin-1', email, role: 'admin' };
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      router.push('/');
      return true;
    }
    // Host login via API
    if (pass === 'host@123') {
      try {
        const res = await fetch(API_ENDPOINTS.HOST_LOGIN, createApiRequestOptions('POST', { email, password: pass }));
        if (res.ok) {
          const data = await res.json();
          const userData: UserType = { id: data.id, email: data.email, role: 'host' };
          localStorage.setItem('user', JSON.stringify(userData));
          setUser(userData);
          router.push('/');
          return true;
        }
      } catch (e) {
        // ignore
      }
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
