'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/api/auth';
import { User } from '@/types/entities';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { user, setUser, clearUser, token, setToken } = useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('auth_token');
        if (storedToken) {
          setToken(storedToken);
          const userData = await authService.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        clearUser();
        localStorage.removeItem('auth_token');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [setUser, setToken, clearUser]);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      setToken(response.token);
      setUser(response.user);
      localStorage.setItem('auth_token', response.token);
      router.push('/dashboard');
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearUser();
      localStorage.removeItem('auth_token');
      router.push('/login');
    }
  };

  const refreshToken = async () => {
    try {
      const response = await authService.refreshToken();
      setToken(response.token);
      localStorage.setItem('auth_token', response.token);
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
