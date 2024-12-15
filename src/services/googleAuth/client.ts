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
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'token',
      scope: this.config.scopes.join(' '),
      prompt: 'consent'
      // Suppression de access_type car incompatible avec response_type=token
    });

    window.location.href = `${this.config.authEndpoint}?${params.toString()}`;
  }

  logout(): void {
    storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
    window.location.href = '/';
  }

  getAccessToken(): string | null {
    return storage.get(STORAGE_KEYS.ACCESS_TOKEN);
  }

  handleCallback(hash: string): void {
    try {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      
      if (!accessToken) {
        throw new Error('No access token received');
      }

      storage.set(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    } catch (error) {
      console.error('Error handling auth callback:', error);
      storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
    }
  }
}

export const googleAuthClient = new GoogleAuthClientService();