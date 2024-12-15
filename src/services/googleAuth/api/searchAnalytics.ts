import { SearchAnalyticsRequest, SearchAnalyticsResponse } from '../types';

export async function fetchSites(accessToken: string) {
  try {
    const response = await fetch(
      'https://www.googleapis.com/webmasters/v3/sites',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching Search Console data:', error);
    throw error;
  }
}

export async function fetchSearchAnalytics(
  accessToken: string, 
  siteUrl: string, 
  params: SearchAnalyticsRequest
): Promise<SearchAnalyticsResponse> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...params,
          dimensionFilterGroups: [],
          searchType: 'web'
        }),
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching search analytics:', error);
    throw error;
  }
}