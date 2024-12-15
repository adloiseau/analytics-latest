import { AUTH_CONFIG } from '../../config/auth.config';
import { STORAGE_KEYS } from '../../config/storage.config';
import { storage } from '../../utils/storage';
import type { TokenResponse, GoogleAuthClient } from './types';

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: any) => GoogleAuthClient;
        };
        revoke: (token: string, callback?: () => void) => void;
      };
    };
  }
}

class GoogleAuthClientService {
  private client: GoogleAuthClient | null = null;

  initialize(): Promise<void> {
    return new Promise((resolve) => {
      if (!window.google?.accounts?.oauth2) {
        throw new Error('Google Identity Services not loaded');
      }

      this.client = window.google.accounts.oauth2.initTokenClient({
        client_id: AUTH_CONFIG.GOOGLE_CLIENT_ID,
        scope: AUTH_CONFIG.SCOPES.join(' '),
        callback: (response: TokenResponse) => {
          if (response.access_token) {
            storage.set(STORAGE_KEYS.ACCESS_TOKEN, response.access_token);
            resolve();
          }
        },
      });

      resolve();
    });
  }

  async login(): Promise<void> {
    if (!this.client) {
      await this.initialize();
    }
    this.client?.requestAccessToken();
  }

  logout(): void {
    const token = storage.get(STORAGE_KEYS.ACCESS_TOKEN);
    if (token && window.google?.accounts) {
      window.google.accounts.revoke(token, () => {
        storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
      });
    }
  }

  getAccessToken(): string | null {
    return storage.get(STORAGE_KEYS.ACCESS_TOKEN);
  }
}

export const googleAuthClient = new GoogleAuthClientService();