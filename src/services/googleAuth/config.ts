import { GoogleAuthConfig } from './types';

export const getAuthConfig = (): GoogleAuthConfig => ({
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  scopes: [
    'https://www.googleapis.com/auth/webmasters.readonly',
    'https://www.googleapis.com/auth/webmasters'
  ],
  authEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  redirectUri: import.meta.env.VITE_REDIRECT_URI
});