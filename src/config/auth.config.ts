export const AUTH_CONFIG = {
  // Firebase authorized users
  AUTHORIZED_EMAILS: (import.meta.env.VITE_AUTHORIZED_EMAILS || '').split(',').filter(Boolean)
} as const;