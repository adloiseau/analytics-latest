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
      redirectUri: `${window.location.origin}/auth/callback`,
      tokenEndpoint: 'https://oauth2.googleapis.com/token'
    };

    // Check for existing token and start refresh if needed
    const accessToken = storage.get(STORAGE_KEYS.ACCESS_TOKEN);
    if (accessToken) {
      this.startTokenRefresh(3600); // Default to 1 hour if we don't know exact expiry
    }
  }

  setQueryClient(client: QueryClient) {
    this.queryClient = client;
  }

  getAccessToken(): string | null {
    const token = storage.get(STORAGE_KEYS.ACCESS_TOKEN);
    console.log('Current access token:', token ? `${token.substring(0, 10)}...` : null);
    return token;
  }

  login(): void {
    console.log('[GoogleAuthClient] Starting login flow');
    this.cleanup();
    
    const state = Math.random().toString(36).substring(7);
    storage.set(STORAGE_KEYS.AUTH_STATE, state);
    storage.set('is_authenticating', 'true');

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent',
      state,
      scope: this.config.scopes.join(' ')
    });

    const authUrl = `${this.config.authEndpoint}?${params.toString()}`;
    console.log('[GoogleAuthClient] Redirecting to:', authUrl);
    window.location.href = authUrl;
  }

  async handleCallback(code: string): Promise<void> {
    console.log('[GoogleAuthClient] Handling callback with code');
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
        console.error('[GoogleAuthClient] Token response error:', error);
        throw new Error(error.error_description || 'Failed to get tokens');
      }

      const tokens = await tokenResponse.json();
      console.log('[GoogleAuthClient] Received tokens successfully');

      storage.set(STORAGE_KEYS.ACCESS_TOKEN, tokens.access_token);
      if (tokens.refresh_token) {
        storage.set(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh_token);
      }

      storage.remove('is_authenticating');
      storage.remove(STORAGE_KEYS.AUTH_STATE);

      this.startTokenRefresh(tokens.expires_in);

      if (this.queryClient) {
        console.log('[GoogleAuthClient] Invalidating queries after token refresh');
        await this.queryClient.invalidateQueries();
        await this.queryClient.refetchQueries();
      }
    } catch (error) {
      console.error('[GoogleAuthClient] Error in handleCallback:', error);
      this.cleanup();
      throw error;
    }
  }

  private startTokenRefresh(expiresIn: number): void {
    console.log('[GoogleAuthClient] Starting token refresh timer');
    if (this.refreshTokenInterval) {
      clearInterval(this.refreshTokenInterval);
    }

    const refreshTime = (expiresIn - 300) * 1000; // 5 minutes before expiration
    this.refreshTokenInterval = setInterval(async () => {
      await this.refreshToken();
    }, refreshTime);
  }

  private async refreshToken(): Promise<void> {
    console.log('[GoogleAuthClient] Attempting to refresh token');
    const refreshToken = storage.get(STORAGE_KEYS.REFRESH_TOKEN);
    if (!refreshToken) {
      console.warn('[GoogleAuthClient] No refresh token found');
      this.cleanup();
      return;
    }

    try {
      const tokens = await refreshAccessToken(refreshToken, this.config);
      console.log('[GoogleAuthClient] Token refreshed successfully');
      
      storage.set(STORAGE_KEYS.ACCESS_TOKEN, tokens.access_token);
      this.startTokenRefresh(tokens.expires_in);

      if (this.queryClient) {
        await this.queryClient.invalidateQueries();
      }
    } catch (error) {
      console.error('[GoogleAuthClient] Error refreshing token:', error);
      this.cleanup();
      throw error;
    }
  }

  private cleanup(): void {
    console.log('[GoogleAuthClient] Cleaning up auth state');
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
    console.log('[GoogleAuthClient] Logging out');
    this.cleanup();
    if (this.queryClient) {
      this.queryClient.clear();
    }
  }
}

export const googleAuthClient = new GoogleAuthClientService();