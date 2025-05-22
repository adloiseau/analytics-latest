import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { googleAuthClient } from '../services/googleAuth/client';
import { useQueryClient } from 'react-query';
import { storage } from '../utils/storage';
import { STORAGE_KEYS } from '../config/storage.config';
import { useAuth } from '../contexts/AuthContext';

export const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        console.log('[AuthCallback] Processing callback...');
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const storedState = storage.get(STORAGE_KEYS.AUTH_STATE);
        
        console.log('[AuthCallback] Auth params:', { 
          hasCode: !!code, 
          hasState: !!state,
          statesMatch: state === storedState
        });
        
        if (!code) {
          throw new Error('No authorization code received');
        }

        if (state !== storedState) {
          console.error('[AuthCallback] State mismatch:', { state, storedState });
          throw new Error('Invalid state parameter');
        }

        await googleAuthClient.handleCallback(code);
        console.log('[AuthCallback] Auth callback handled successfully');
        
        // Prefetch initial data
        await Promise.all([
          queryClient.prefetchQuery('sites'),
          queryClient.prefetchQuery(['searchConsole', 'site'])
        ]);

        // Clear auth state and redirect
        storage.remove('is_authenticating');
        storage.remove(STORAGE_KEYS.AUTH_STATE);
        
        // Force a full page reload to ensure all auth states are properly updated
        window.location.href = '/';
      } catch (error) {
        console.error('[AuthCallback] Error:', error);
        storage.remove('is_authenticating');
        storage.remove(STORAGE_KEYS.AUTH_STATE);
        navigate('/login', { replace: true });
      }
    };

    if (!isAuthenticated) {
      handleAuth();
    } else {
      navigate('/', { replace: true });
    }
  }, [navigate, searchParams, queryClient, isAuthenticated]);

  return (
    <div className="min-h-screen bg-[#141517] flex items-center justify-center">
      <div className="flex items-center gap-3 text-gray-400">
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
        <span>Authentification en cours...</span>
      </div>
    </div>
  );
};