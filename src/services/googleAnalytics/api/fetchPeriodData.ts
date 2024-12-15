import { AnalyticsApiResponse } from '../types';

export async function fetchPeriodData(
  propertyId: string, 
  accessToken: string, 
  startDate: string, 
  endDate: string
): Promise<AnalyticsApiResponse> {
  const response = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dateRanges: [{ startDate, endDate }],
        dimensions: [
          { name: 'date' },
          { name: 'sessionSource' }
        ],
        metrics: [
          { name: 'sessions' }
        ]
      })
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
}