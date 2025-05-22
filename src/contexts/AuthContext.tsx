import React, { createContext, useContext, useState, useEffect } from 'react';
import { useFirebaseAuth } from './FirebaseAuthContext';
import { googleAuthClient } from '../services/googleAuth/client';
import { useQueryClient } from 'react-query';
import { storage } from '../utils/storage';
import { STORAGE_KEYS } from '../config/storage.config';

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  isInitialized: boolean;
}

interface AuthContextType extends AuthState {
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAuthorized } = useFirebaseAuth();
  const queryClient = useQueryClient();
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    accessToken: null,
    isInitialized: false
  });

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = storage.get(STORAGE_KEYS.ACCESS_TOKEN);
        const isAuthenticating = storage.get('is_authenticating');
        const isCallback = window.location.pathname === '/auth/callback';

        if (currentUser && isAuthorized) {
          if (token) {
            setAuthState({
              isAuthenticated: true,
              accessToken: token,
              isInitialized: true
            });

            await queryClient.prefetchQuery('sites');
          } else if (!isAuthenticating && !isCallback) {
            storage.set('is_authenticating', 'true');
            googleAuthClient.login();
          }
        } else {
          storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
          storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
          storage.remove('is_authenticating');
          
          setAuthState({
            isAuthenticated: false,
            accessToken: null,
            isInitialized: true
          });
        }
      } catch (error) {
        setAuthState(prev => ({ ...prev, isInitialized: true }));
      }
    };

    initAuth();
  }, [currentUser, isAuthorized, queryClient]);

  const login = () => {
    googleAuthClient.login();
  };

  const logout = () => {
    googleAuthClient.logout();
    setAuthState({
      isAuthenticated: false,
      accessToken: null,
      isInitialized: true
    });
    queryClient.clear();
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