import { getRedirectUri } from '../utils/environment';

export const GOOGLE_CONFIG = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '',
  get redirectUri() {
    return getRedirectUri();
  },
  scope: (import.meta.env.VITE_OAUTH_SCOPES || '').split(',').join(' ')
};