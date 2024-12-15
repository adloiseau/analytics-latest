import { getRedirectUri } from '../utils/environment';

export const AUTH_CONFIG = {
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  SCOPES: (import.meta.env.VITE_OAUTH_SCOPES || '').split(',').filter(Boolean),
  AUTH_ENDPOINT: 'https://accounts.google.com/o/oauth2/v2/auth',
  get REDIRECT_URI() {
    return getRedirectUri();
  }
} as const;