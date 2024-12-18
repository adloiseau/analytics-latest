import { GoogleAuthConfig } from './types';
import { storage } from '../../utils/storage';
import { STORAGE_KEYS } from '../../config/storage.config';
import { refreshAccessToken } from './refreshToken';
import { QueryClient } from 'react-query';

class GoogleAuthClientService {
  private config: GoogleAuthConfig;
  private refreshTokenTimeout: NodeJS.Timeout | null = null;
  private queryClient: QueryClient | null = null;

  constructor() {
    this.config = {
      clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
      clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '',
      scopes: (import.meta.env.VITE_OAUTH_SCOPES || '').split(',').filter(Boolean),
      authEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      redirectUri: window.location.origin + '/auth/callback',
      tokenEndpoint: 'https://oauth2.googleapis.com/token'
    };
  }

  setQueryClient(client: QueryClient) {
    this.queryClient = client;
  }

  getAccessToken(): string | null {
    return storage.get(STORAGE_KEYS.ACCESS_TOKEN);
  }

  login(): void {
    this.logout();
    const state = Math.random().toString(36).substring(7);
    storage.set(STORAGE_KEYS.AUTH_STATE, state);

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent',
      state,
      scope: this.config.scopes.join(' ')
    });

    window.location.href = `${this.config.authEndpoint}?${params.toString()}`;
  }

  async handleCallback(code: string): Promise<void> {
    try {
      const response = await fetch(this.config.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: this.config.redirectUri
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error_description || 'Failed to get tokens');
      }

      storage.set(STORAGE_KEYS.ACCESS_TOKEN, data.access_token);
      if (data.refresh_token) {
        storage.set(STORAGE_KEYS.REFRESH_TOKEN, data.refresh_token);
      }
      
      storage.remove('is_authenticating');
      this.setupRefreshTimer(data.expires_in);

      // Invalider et rafraîchir les requêtes après l'obtention du token
      if (this.queryClient) {
        await this.queryClient.invalidateQueries();
        await this.queryClient.refetchQueries();
      }
    } catch (error) {
      storage.remove('is_authenticating');
      console.error('Error exchanging code for tokens:', error);
      throw error;
    }
  }

  logout(): void {
    if (this.refreshTokenTimeout) {
      clearTimeout(this.refreshTokenTimeout);
    }
    storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
    storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
    storage.remove(STORAGE_KEYS.AUTH_STATE);
    if (this.queryClient) {
      this.queryClient.clear();
    }
  }

  private setupRefreshTimer(expiresIn: number): void {
    if (this.refreshTokenTimeout) {
      clearTimeout(this.refreshTokenTimeout);
    }
    const refreshTime = (expiresIn - 300) * 1000;
    this.refreshTokenTimeout = setTimeout(() => this.refreshToken(), refreshTime);
  }

  private async refreshToken(): Promise<void> {
    const refreshToken = storage.get(STORAGE_KEYS.REFRESH_TOKEN);
    if (!refreshToken) {
      this.logout();
      return;
    }

    try {
      const data = await refreshAccessToken(refreshToken, this.config);
      storage.set(STORAGE_KEYS.ACCESS_TOKEN, data.access_token);
      this.setupRefreshTimer(data.expires_in);
    } catch (error) {
      console.error('Error refreshing token:', error);
      this.logout();
    }
  }
}

export const googleAuthClient = new GoogleAuthClientService();