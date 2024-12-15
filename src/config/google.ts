export const GOOGLE_CONFIG = {
  clientId: process.env.VITE_GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.VITE_GOOGLE_CLIENT_SECRET || '',
  redirectUri: process.env.VITE_GOOGLE_REDIRECT_URI || 'http://localhost:5173/auth/callback',
  scope: [
    'https://www.googleapis.com/auth/webmasters.readonly',
    'https://www.googleapis.com/auth/webmasters',
  ].join(' ')
};