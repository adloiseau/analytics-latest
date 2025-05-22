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
  return import.meta.env.VITE_REDIRECT_URI;
};

/**
 * Validate environment variables
 */
export const validateEnvVariables = () => {
  const required = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_GOOGLE_CLIENT_ID',
    'VITE_OAUTH_SCOPES',
    'VITE_REDIRECT_URI'
  ];

  const missing = required.filter(key => !import.meta.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

/**
 * Get environment variable with validation
 */
export const getEnvVariable = (key: string): string => {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is required`);
  }
  return value;
};