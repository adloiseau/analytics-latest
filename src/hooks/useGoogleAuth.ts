import { useState, useCallback, useEffect } from 'react';
import { googleAuthClient } from '../services/googleAuth/client';

export const useGoogleAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const token = googleAuthClient.getAccessToken();
    setIsAuthenticated(!!token);
    setIsInitialized(true);
  }, []);

  const login = useCallback(() => {
    googleAuthClient.login();
  }, []);

  const logout = useCallback(() => {
    googleAuthClient.logout();
    setIsAuthenticated(false);
  }, []);

  return {
    isAuthenticated,
    isInitialized,
    login,
    logout,
  };
};