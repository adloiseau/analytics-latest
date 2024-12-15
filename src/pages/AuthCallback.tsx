import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { googleAuthClient } from '../services/googleAuth/client';

export const AuthCallback: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      if (window.location.hash) {
        googleAuthClient.handleCallback(window.location.hash);
        navigate('/');
      } else {
        setError('No authentication data received');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError('Authentication failed');
    }
  }, [navigate]);

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