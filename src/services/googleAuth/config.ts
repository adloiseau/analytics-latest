import { GoogleAuthConfig } from './types';

export const getAuthConfig = (): GoogleAuthConfig => ({
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  scopes: (import.meta.env.VITE_OAUTH_SCOPES || '').split(','),
  authEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  redirectUri: import.meta.env.VITE_REDIRECT_URI
});