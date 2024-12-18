import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { googleAuthClient } from '../services/googleAuth/client';
import { useQueryClient } from 'react-query';

export const AuthCallback: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        
        if (!code) {
          throw new Error('No authorization code received');
        }

        if (state !== localStorage.getItem('gsc_auth_state')) {
          throw new Error('Invalid state parameter');
        }

        await googleAuthClient.handleCallback(code);
        
        // Invalider et rafraîchir les requêtes après l'authentification
        await queryClient.invalidateQueries();
        await queryClient.refetchQueries();
        
        navigate('/');
      } catch (error) {
        console.error('Authentication error:', error);
        setError('Authentication failed');
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