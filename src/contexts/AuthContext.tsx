import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, SignupRequest } from '../types';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

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

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        // Verify token with backend
        const response = await authAPI.verify();
        setUser(response.data.user);
        setBackendAvailable(true);
      }
    } catch (error: any) {
      console.error('Auth check failed:', error);
      
      // Check if it's a network error (backend unavailable)
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        console.log('Backend appears to be unavailable');
        setBackendAvailable(false);
        
        // If we have a token but backend is down, keep the user logged in
        // but show a warning
        const token = localStorage.getItem('authToken');
        if (token) {
          // Create a temporary user object from stored data
          const storedUser = localStorage.getItem('userData');
          if (storedUser) {
            try {
              setUser(JSON.parse(storedUser));
              toast.error('Backend is currently unavailable. Some features may not work.');
            } catch (e) {
              localStorage.removeItem('authToken');
              localStorage.removeItem('userData');
            }
          }
        }
      } else {
        // Other errors (401, etc.) - clear auth data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        setBackendAvailable(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await authAPI.login({ email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(user));
      setUser(user);
      setBackendAvailable(true);
      
      toast.success('Login successful!');
      return true;
    } catch (error: any) {
      console.error('Login failed:', error);
      
      // Check if it's a network error (backend unavailable)
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        toast.error('Backend is currently unavailable. Please try again later.');
        setBackendAvailable(false);
      } else {
        toast.error(error.response?.data?.message || 'Login failed');
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (data: SignupRequest): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await authAPI.signup(data);
      const { token, user } = response.data;
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(user));
      setUser(user);
      setBackendAvailable(true);
      
      toast.success('Account created successfully!');
      return true;
    } catch (error: any) {
      console.error('Signup failed:', error);
      
      // Check if it's a network error (backend unavailable)
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        toast.error('Backend is currently unavailable. Please try again later.');
        setBackendAvailable(false);
      } else {
        toast.error(error.response?.data?.message || 'Signup failed');
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const refreshUser = async () => {
    try {
      const response = await authAPI.me();
      const user = response.data.user;
      setUser(user);
      localStorage.setItem('userData', JSON.stringify(user));
      setBackendAvailable(true);
    } catch (error: any) {
      console.error('Failed to refresh user:', error);
      
      // Check if it's a network error (backend unavailable)
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        setBackendAvailable(false);
        // Don't logout if backend is just unavailable
        toast.error('Backend is currently unavailable. Some features may not work.');
      } else {
        logout();
      }
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