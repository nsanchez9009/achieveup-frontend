import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';
import { User, SignupRequest } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (data: SignupRequest) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  backendAvailable: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [backendAvailable, setBackendAvailable] = useState(true);

  // Check authentication status on app load
  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setUser(null);
        setBackendAvailable(true);
        return;
      }

      // Verify token and get user info
      const response = await authAPI.me();
      const userData = response.data.user || response.data;
      
      // Only allow instructors
      if (userData.canvasTokenType !== 'instructor' && userData.role !== 'instructor') {
        console.warn('Non-instructor user detected, logging out');
        localStorage.removeItem('token');
        setUser(null);
        return;
      }
      
      setUser(userData);
      setBackendAvailable(true);
    } catch (error: any) {
      console.error('Auth check failed:', error);
      
      // Handle different error types
      if (error.code === 'NETWORK_ERROR' || error.message?.includes('fetch')) {
        setBackendAvailable(false);
      } else {
        setBackendAvailable(true);
      }
      
      // Clear invalid token
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await authAPI.login({ email, password });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        
        // Get user data
        const userResponse = await authAPI.me();
        const userData = userResponse.data.user || userResponse.data;
        
        // Only allow instructors
        if (userData.canvasTokenType !== 'instructor' && userData.role !== 'instructor') {
          localStorage.removeItem('token');
          throw new Error('Only instructors can access this application');
        }
        
        setUser(userData);
        setBackendAvailable(true);
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Login failed:', error);
      if (error.code === 'NETWORK_ERROR') {
        setBackendAvailable(false);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (data: SignupRequest): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Ensure only instructor signups are allowed
      const signupData = {
        ...data,
        canvasTokenType: 'instructor' as const,
        role: 'instructor' as const
      };
      
      const response = await authAPI.signup(signupData);
      
              if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          const userResponse = await authAPI.me();
          const userData = userResponse.data.user || userResponse.data;
          setUser(userData);
          setBackendAvailable(true);
          return true;
        }
      
      return false;
    } catch (error: any) {
      console.error('Signup failed:', error);
      if (error.code === 'NETWORK_ERROR') {
        setBackendAvailable(false);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const response = await authAPI.me();
      const userData = response.data.user || response.data;
      
      // Only allow instructors
      if (userData.canvasTokenType !== 'instructor' && userData.role !== 'instructor') {
        logout();
        return;
      }
      
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      logout();
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    signup,
    logout,
    refreshUser,
    isAuthenticated: !!user,
    backendAvailable,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 