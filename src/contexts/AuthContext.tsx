import React, { createContext, useContext, useState, useEffect } from 'react';
import { googleAuthClient } from '../services/googleAuth/client';
import type { AuthState } from '../services/googleAuth/types';

interface AuthContextType extends AuthState {
  login: () => void;
  logout: () => void;
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    accessToken: null,
  });
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = googleAuthClient.getAccessToken();
        if (token) {
          setAuthState({
            isAuthenticated: true,
            accessToken: token,
          });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initAuth();
  }, []);

  const login = () => {
    googleAuthClient.login();
  };

  const logout = () => {
    googleAuthClient.logout();
    setAuthState({
      isAuthenticated: false,
      accessToken: null,
    });
  };

  return (
    <AuthContext.Provider value={{ ...authState, isInitialized, login, logout }}>
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