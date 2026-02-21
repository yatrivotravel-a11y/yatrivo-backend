import { useState, useEffect } from 'react';
import { login, signup, forgotPassword, type LoginCredentials, type AuthResponse } from '@/lib/api';

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

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
    const storedExpiry = localStorage.getItem('auth_expiry');

    const isSessionValid =
      storedToken &&
      storedUser &&
      storedExpiry &&
      Date.now() < parseInt(storedExpiry, 10);

    if (isSessionValid) {
      setAuthState({
        user: JSON.parse(storedUser!),
        token: storedToken!,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      // Clear any expired/incomplete session data
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_expiry');
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const loginUser = async (credentials: LoginCredentials) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    const response = await login(credentials);
    
    if (response.success && response.data) {
      const { user, token } = response.data;
      
      // Store in localStorage with 7-day expiry
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));
      localStorage.setItem('auth_expiry', String(Date.now() + SESSION_DURATION_MS));
      
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
      localStorage.setItem('auth_expiry', String(Date.now() + SESSION_DURATION_MS));
      
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
    localStorage.removeItem('auth_expiry');
    
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
