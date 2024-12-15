import { GoogleAuthConfig } from './types';
import { getAuthConfig } from './config';
import { storage } from '../../utils/storage';
import { STORAGE_KEYS } from '../../config/storage.config';

class GoogleAuthClientService {
  private config: GoogleAuthConfig;

  constructor() {
    this.config = getAuthConfig();
  }

  login(): void {
    const state = Math.random().toString(36).substring(7);
    storage.set(STORAGE_KEYS.AUTH_STATE, state);

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'token',
      state,
      scope: this.config.scopes.join(' '),
      prompt: 'consent'
    });

    window.location.href = `${this.config.authEndpoint}?${params.toString()}`;
  }

  logout(): void {
    storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
    storage.remove(STORAGE_KEYS.AUTH_STATE);
    window.location.href = '/';
  }

  getAccessToken(): string | null {
    return storage.get(STORAGE_KEYS.ACCESS_TOKEN);
  }

  handleCallback(hash: string): void {
    try {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      const state = params.get('state');
      
      const storedState = storage.get(STORAGE_KEYS.AUTH_STATE);
      if (state !== storedState) {
        throw new Error('Invalid state parameter');
      }

      if (!accessToken) {
        throw new Error('No access token received');
      }

      storage.set(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      storage.remove(STORAGE_KEYS.AUTH_STATE);
    } catch (error) {
      console.error('Error handling auth callback:', error);
      storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
      storage.remove(STORAGE_KEYS.AUTH_STATE);
      throw error;
    }
  }
}

export const googleAuthClient = new GoogleAuthClientService();