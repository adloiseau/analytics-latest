import { GoogleAuthConfig } from './types';
import { storage } from '../../utils/storage';
import { STORAGE_KEYS } from '../../config/storage.config';
import { refreshAccessToken } from './refreshToken';
import { QueryClient } from 'react-query';

class GoogleAuthClientService {
  private config: GoogleAuthConfig;
  private refreshTokenInterval: NodeJS.Timer | null = null;
  private queryClient: QueryClient | null = null;

  constructor() {
    this.config = {
      clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
      scopes: (import.meta.env.VITE_OAUTH_SCOPES || '').split(',').filter(Boolean),
      authEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      redirectUri: import.meta.env.VITE_REDIRECT_URI,
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
    this.cleanup();
    
    const state = Math.random().toString(36).substring(7);
    storage.set(STORAGE_KEYS.AUTH_STATE, state);
    storage.set('is_authenticating', 'true');

    // Use different scopes and parameters for Google APIs (not Firebase)
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent',
      state,
      scope: this.config.scopes.join(' '),
      include_granted_scopes: 'true',
      // Add parameter to differentiate from Firebase auth
      login_hint: 'google_apis_only'
    });

    const authUrl = `${this.config.authEndpoint}?${params.toString()}`;
    window.location.href = authUrl;
  }

  async handleCallback(code: string): Promise<void> {
    try {
      const tokenResponse = await fetch(this.config.tokenEndpoint, {
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

      if (!tokenResponse.ok) {
        const error = await tokenResponse.json();
        throw new Error(error.error_description || 'Failed to get Google APIs tokens');
      }

      const tokens = await tokenResponse.json();

      // Store Google APIs tokens (separate from Firebase)
      storage.set(STORAGE_KEYS.ACCESS_TOKEN, tokens.access_token);
      if (tokens.refresh_token) {
        storage.set(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh_token);
      }

      storage.remove('is_authenticating');
      storage.remove(STORAGE_KEYS.AUTH_STATE);

      this.startTokenRefresh(tokens.expires_in);

      if (this.queryClient) {
        await this.queryClient.invalidateQueries();
      }
    } catch (error) {
      this.cleanup();
      throw error;
    }
  }

  private startTokenRefresh(expiresIn: number): void {
    if (this.refreshTokenInterval) {
      clearInterval(this.refreshTokenInterval);
    }

    const refreshTime = (expiresIn - 300) * 1000; // 5 minutes before expiration
    this.refreshTokenInterval = setInterval(async () => {
      await this.refreshToken();
    }, refreshTime);
  }

  private async refreshToken(): void {
    const refreshToken = storage.get(STORAGE_KEYS.REFRESH_TOKEN);
    if (!refreshToken) {
      this.cleanup();
      return;
    }

    try {
      const tokens = await refreshAccessToken(refreshToken, this.config);
      storage.set(STORAGE_KEYS.ACCESS_TOKEN, tokens.access_token);
      this.startTokenRefresh(tokens.expires_in);

      if (this.queryClient) {
        await this.queryClient.invalidateQueries();
      }
    } catch (error) {
      this.cleanup();
    }
  }

  private cleanup(): void {
    if (this.refreshTokenInterval) {
      clearInterval(this.refreshTokenInterval);
      this.refreshTokenInterval = null;
    }
    storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
    storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
    storage.remove(STORAGE_KEYS.AUTH_STATE);
    storage.remove('is_authenticating');
  }

  logout(): void {
    this.cleanup();
    if (this.queryClient) {
      // Only invalidate Google APIs related queries
      this.queryClient.invalidateQueries('sites');
      this.queryClient.invalidateQueries('searchConsole');
    }
  }
}

export const googleAuthClient = new GoogleAuthClientService();