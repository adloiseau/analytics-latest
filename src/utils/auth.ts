import { AUTH_CONFIG, STORAGE_KEYS } from '../config/constants';

export const generateAuthUrl = () => {
  const state = Math.random().toString(36).substring(7);
  localStorage.setItem(STORAGE_KEYS.AUTH_STATE, state);

  const params = new URLSearchParams({
    client_id: AUTH_CONFIG.GOOGLE_CLIENT_ID,
    redirect_uri: AUTH_CONFIG.REDIRECT_URI,
    response_type: 'token',
    scope: AUTH_CONFIG.SCOPES.join(' '),
    state,
    prompt: 'consent',
    access_type: 'online'
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

export const handleAuthRedirect = () => {
  const fragment = new URLSearchParams(window.location.hash.substring(1));
  const storedState = localStorage.getItem(STORAGE_KEYS.AUTH_STATE);
  const returnedState = fragment.get('state');

  if (storedState !== returnedState) {
    throw new Error('Invalid authentication state');
  }

  const accessToken = fragment.get('access_token');
  if (!accessToken) {
    throw new Error('No access token received');
  }

  localStorage.removeItem(STORAGE_KEYS.AUTH_STATE);
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);

  return accessToken;
};