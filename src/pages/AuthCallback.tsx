import React, { useEffect, useState } from 'react';
import { googleAuthClient } from '../services/googleAuth/client';

export const AuthCallback: React.FC = () => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (window.location.hash) {
        googleAuthClient.handleCallback(window.location.hash);
        window.location.href = '/';
      } else {
        setError('No authentication data received');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError('Authentication failed');
    }
  }, []);

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