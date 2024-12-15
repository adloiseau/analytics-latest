export interface GoogleAuthConfig {
  clientId: string;
  clientSecret: string;
  scopes: string[];
  authEndpoint: string;
  redirectUri: string;
  tokenEndpoint: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
}

export interface AuthError {
  code: string;
  message: string;
  error_description?: string;
}

export interface SearchAnalyticsRequest {
  startDate: string;
  endDate: string;
  dimensions: string[];
  rowLimit: number;
}

export interface SearchAnalyticsRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface SearchAnalyticsResponse {
  rows?: SearchAnalyticsRow[];
  responseAggregationType?: string;
}

export interface IndexedPagesResponse {
  total: number;
  indexed: number;
}