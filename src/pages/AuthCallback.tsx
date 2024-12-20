import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { googleAuthClient } from '../services/googleAuth/client';
import { useQueryClient } from 'react-query';
import { storage } from '../utils/storage';
import { STORAGE_KEYS } from '../config/storage.config';

export const AuthCallback: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

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
          statesMatch: state === storedState,
          currentPath: window.location.pathname
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
        await queryClient.prefetchQuery('sites');
        await queryClient.prefetchQuery(['searchConsole', 'site']);
        
        navigate('/');
      } catch (error) {
        console.error('[AuthCallback] Error:', error);
        setError(error instanceof Error ? error.message : 'Authentication failed');
      }
    };

    handleAuth();
  }, [navigate, searchParams, queryClient]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#141517] flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141517] flex items-center justify-center">
      <div className="text-white">Authentification en cours...</div>
    </div>
  );
};