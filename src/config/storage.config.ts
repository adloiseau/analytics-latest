export const STORAGE_KEYS = {
  // Google APIs tokens (separate from Firebase)
  ACCESS_TOKEN: 'gsc_access_token',
  REFRESH_TOKEN: 'gsc_refresh_token',
  AUTH_STATE: 'gsc_auth_state',
  
  // Firebase token (separate storage)
  FIREBASE_TOKEN: 'firebase_token'
} as const;