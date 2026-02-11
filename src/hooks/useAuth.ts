import { useState, useEffect } from 'react';
import { login, signup, forgotPassword, type LoginCredentials, type AuthResponse } from '@/lib/api';

export interface AuthState {
  user: AuthResponse['user'] | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Check for stored auth data on mount
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');

    if (storedToken && storedUser) {
      setAuthState({
        user: JSON.parse(storedUser),
        token: storedToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const loginUser = async (credentials: LoginCredentials) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    const response = await login(credentials);
    
    if (response.success && response.data) {
      const { user, token } = response.data;
      
      // Store in localStorage
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));
      
      setAuthState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
      
      return { success: true, message: response.message };
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: response.error };
    }
  };

  const signupUser = async (data: {
    email: string;
    password: string;
    fullName: string;
    mobileNumber: string;
  }) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    const response = await signup(data);
    
    if (response.success && response.data) {
      const { user, token } = response.data;
      
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));
      
      setAuthState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
      
      return { success: true, message: response.message };
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: response.error };
    }
  };

  const resetPassword = async (email: string) => {
    const response = await forgotPassword(email);
    return response;
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return {
    ...authState,
    loginUser,
    signupUser,
    resetPassword,
    logout,
  };
}
