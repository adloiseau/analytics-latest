import React from 'react';
import { Navigate } from 'react-router-dom';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';

export const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading, isAuthorized } = useFirebaseAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141517] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!currentUser || !isAuthorized) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};