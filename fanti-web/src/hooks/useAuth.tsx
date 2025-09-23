'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar autenticação inicial
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const data = localStorage.getItem('access_token');
        setIsAuthenticated(!!data);
      } catch (error) {
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data?.data) {

        localStorage.setItem('access_token', data.data.accessToken);
        localStorage.setItem('token_type', data.data.tokenType);
        localStorage.setItem('expires_at', (Date.now() + data.data.expiresIn * 1000).toString());
        localStorage.setItem('user', JSON.stringify(data.data.user));

        setIsAuthenticated(true);
        setUser(data.data.user ?? null);
        console.log("User logged in:", data.data.user);
      } else {
        setIsAuthenticated(false);
        setUser(null);
        throw new Error(data?.error || 'Erro ao fazer login');
      }
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);

    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/auth', { method: 'DELETE' });
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      localStorage.clear();
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth', { method: 'GET' });
      const data = await res.json();
      setUser(data?.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

// Hook para verificar se o usuário tem uma role específica
export function useHasRole(requiredRole: string | string[]) {
  const { user } = useAuth();

  if (!user) return false;

  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(user.role);
  }

  return user.role === requiredRole;
}

// Hook para verificar se o usuário é admin
export function useIsAdmin() {
  return useHasRole('Administrador');
}
