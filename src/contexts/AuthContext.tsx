import React, { createContext, useContext, useState, useEffect } from 'react';
import { useFirebaseAuth } from './FirebaseAuthContext';
import { googleAuthClient } from '../services/googleAuth/client';
import { useQueryClient } from 'react-query';

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
        if (currentUser && isAuthorized) {
          const token = googleAuthClient.getAccessToken();
          setAuthState({
            isAuthenticated: !!token,
            accessToken: token,
            isInitialized: true
          });

          // Invalider et rafraîchir les requêtes après l'authentification
          if (token) {
            queryClient.invalidateQueries('searchConsole');
            queryClient.invalidateQueries('analytics');
          }
        } else {
          setAuthState({
            isAuthenticated: false,
            accessToken: null,
            isInitialized: true
          });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
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
    // Nettoyer le cache des requêtes lors de la déconnexion
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