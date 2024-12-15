export const AUTH_CONFIG = {
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  SCOPES: (import.meta.env.VITE_OAUTH_SCOPES || '').split(','),
  AUTH_ENDPOINT: 'https://accounts.google.com/o/oauth2/v2/auth',
  REDIRECT_URI: import.meta.env.VITE_REDIRECT_URI || 'http://localhost:5173/auth/callback'
} as const;