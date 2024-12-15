export interface TokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

export interface GoogleAuthClient {
  requestAccessToken: () => void;
}