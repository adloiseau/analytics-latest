import React, { createContext, useContext, useState, useEffect } from 'react';
import { googleAuthClient } from '../services/googleAuth/client';
import type { AuthState } from '../services/googleAuth/types';

interface AuthContextType extends AuthState {
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    accessToken: null,
  });

  useEffect(() => {
    const token = googleAuthClient.getAccessToken();
    if (token) {
      setAuthState({
        isAuthenticated: true,
        accessToken: token,
      });
    }
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
    <AuthContext.Provider value={{ ...authState, login, logout }}>
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