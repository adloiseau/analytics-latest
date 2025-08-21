import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { googleAuthClient } from '../services/googleAuth/client';
import { useQueryClient } from 'react-query';
import { storage } from '../utils/storage';
import { STORAGE_KEYS } from '../config/storage.config';
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext';

export const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currentUser, isAuthorized } = useFirebaseAuth();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Check if user is authenticated with Firebase first
        if (!currentUser || !isAuthorized) {
          navigate('/login', { replace: true });
          return;
        }

        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const storedState = storage.get(STORAGE_KEYS.AUTH_STATE);
        
        if (!code) {
          throw new Error('No authorization code received');
        }

        if (state !== storedState) {
          throw new Error('Invalid state parameter');
        }

        await googleAuthClient.handleCallback(code);
        
        // Prefetch Google APIs data
        await Promise.all([
          queryClient.prefetchQuery('sites'),
          queryClient.prefetchQuery(['searchConsole', 'site'])
        ]);

        // Clear auth state and redirect
        storage.remove('is_authenticating');
        storage.remove(STORAGE_KEYS.AUTH_STATE);
        
        // Redirect to dashboard
        navigate('/', { replace: true });
      } catch (error) {
        storage.remove('is_authenticating');
        storage.remove(STORAGE_KEYS.AUTH_STATE);
        
        // Redirect to dashboard even if Google APIs auth failed
        // User can try again with the "G" button
        navigate('/', { replace: true });
      }
    };

    handleAuth();
  }, [navigate, searchParams, queryClient, currentUser, isAuthorized]);

  return (
    <div className="min-h-screen bg-[#141517] flex items-center justify-center">
      <div className="flex items-center gap-3 text-gray-400">
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
        <span>Configuration des APIs Google...</span>
      </div>
    </div>
  );
};