export const AUTH_CONFIG = {
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  SCOPES: [
    'https://www.googleapis.com/auth/webmasters.readonly',
    'https://www.googleapis.com/auth/webmasters'
  ]
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'gsc_access_token'
} as const;