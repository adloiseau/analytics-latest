import { GoogleAuthConfig } from './types';

export async function refreshAccessToken(refreshToken: string, config: GoogleAuthConfig) {
  const response = await fetch(config.tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    })
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error_description || 'Failed to refresh token');
  }

  return data;
}