import { GoogleAuthConfig } from './types';
import { getRedirectUri } from '../../utils/environment';

export const getAuthConfig = (): GoogleAuthConfig => ({
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  scopes: (import.meta.env.VITE_OAUTH_SCOPES || '').split(',').filter(Boolean),
  authEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  redirectUri: getRedirectUri(),
  tokenEndpoint: 'https://oauth2.googleapis.com/token'
});