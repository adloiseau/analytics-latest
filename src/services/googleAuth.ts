import { AUTH_CONFIG, STORAGE_KEYS } from '../config/constants';

declare global {
  interface Window {
    google: any;
  }
}

export class GoogleAuthService {
  private static client: any;

  static initialize() {
    return new Promise((resolve) => {
      window.google?.accounts.oauth2.initTokenClient({
        client_id: AUTH_CONFIG.GOOGLE_CLIENT_ID,
        scope: AUTH_CONFIG.SCOPES.join(' '),
        callback: (response: any) => {
          if (response.access_token) {
            localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.access_token);
            resolve(response.access_token);
          }
        },
      }).then((client: any) => {
        this.client = client;
        resolve(null);
      });
    });
  }

  static async login() {
    if (!this.client) {
      await this.initialize();
    }
    this.client?.requestAccessToken();
  }

  static logout(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    window.google?.accounts.oauth2.revoke(
      localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
      () => {
        console.log('Token révoqué');
      }
    );
  }

  static getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  static async fetchSearchConsoleData(accessToken: string) {
    try {
      const response = await fetch(
        'https://www.googleapis.com/webmasters/v3/sites',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return await response.json();
    } catch (error) {
      console.error('Error fetching Search Console data:', error);
      throw error;
    }
  }
}