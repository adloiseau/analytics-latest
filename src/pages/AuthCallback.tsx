import React, { useEffect } from 'react';
import { handleAuthRedirect } from '../utils/auth';

export const AuthCallback: React.FC = () => {
  useEffect(() => {
    try {
      handleAuthRedirect();
      window.location.href = '/';
    } catch (error) {
      console.error('Authentication error:', error);
      window.location.href = '/?error=auth_failed';
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#141517] flex items-center justify-center">
      <div className="text-white">Authentification en cours...</div>
    </div>
  );
};