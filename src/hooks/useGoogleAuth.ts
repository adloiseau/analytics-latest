import { useState, useCallback, useEffect } from 'react';
import { googleAuthClient } from '../services/googleAuth/client';

export const useGoogleAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await googleAuthClient.initialize();
        const token = googleAuthClient.getAccessToken();
        setIsAuthenticated(!!token);
      } catch (error) {
        console.error('Failed to initialize Google Auth:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => initAuth();
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  const login = useCallback(async () => {
    try {
      await googleAuthClient.login();
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login error:', error);
    }
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