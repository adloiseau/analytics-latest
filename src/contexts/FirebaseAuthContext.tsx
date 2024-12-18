import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { AUTH_CONFIG } from '../config/auth.config';
import { useNavigate } from 'react-router-dom';
import { googleAuthClient } from '../services/googleAuth/client';
import { storage } from '../utils/storage';
import { STORAGE_KEYS } from '../config/storage.config';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isAuthorized: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const isUserAuthorized = (user: User | null): boolean => {
  if (!user?.email) return false;
  return AUTH_CONFIG.AUTHORIZED_EMAILS.includes(user.email);
};

export const FirebaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      const authorized = isUserAuthorized(user);
      setIsAuthorized(authorized);
      
      if (user && authorized) {
        // Store Firebase ID token
        const idToken = await user.getIdToken();
        storage.set('firebase_token', idToken);
        
        // Check if we need to initiate Google OAuth
        const hasGoogleTokens = storage.get(STORAGE_KEYS.ACCESS_TOKEN);
        const isAuthenticating = storage.get('is_authenticating');
        
        if (!hasGoogleTokens && !isAuthenticating) {
          storage.set('is_authenticating', 'true');
          googleAuthClient.login();
        }
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      if (!isUserAuthorized(result.user)) {
        await firebaseSignOut(auth);
        throw new Error('Email non autorisé');
      }
      
      navigate('/');
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(error.code === 'auth/unauthorized-domain' 
        ? 'Email non autorisé' 
        : 'Échec de la connexion avec Google');
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      googleAuthClient.logout();
      storage.remove('firebase_token');
      storage.remove('is_authenticating');
      navigate('/login');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    loading,
    signInWithGoogle,
    signOut,
    isAuthorized
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useFirebaseAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
};