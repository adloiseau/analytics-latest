/**
 * Get the base URL for the current environment
 */
export const getBaseUrl = (): string => {
  if (typeof window === 'undefined') return '';

  // For production environment
  if (import.meta.env.PROD) {
    return window.location.origin;
  }

  // For development environment
  return 'http://localhost:5173';
};

/**
 * Get the full redirect URI for OAuth
 */
export const getRedirectUri = (): string => {
  return `${getBaseUrl()}/auth/callback`;
};