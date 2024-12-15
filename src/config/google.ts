export const GOOGLE_CONFIG = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '',
  redirectUri: import.meta.env.VITE_REDIRECT_URI || 'http://localhost:5173/auth/callback',
  scope: (import.meta.env.VITE_OAUTH_SCOPES || '').split(',').join(' ')
};