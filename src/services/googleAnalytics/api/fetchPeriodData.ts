import { AnalyticsApiResponse } from '../types';
import { DateRange } from '../../../types/filters';
import { getDateRange } from '../../../utils/dates';

export async function fetchPeriodData(
  propertyId: string, 
  accessToken: string,
  dateRange: DateRange
): Promise<AnalyticsApiResponse> {
  const { startDate, endDate } = getDateRange(dateRange);

  const response = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dateRanges: [
          { startDate, endDate }
        ],
        dimensions: [
          { name: 'date' }
        ],
        metrics: [
          { name: 'activeUsers' },
          { name: 'screenPageViews' }
        ]
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch analytics data: ${response.statusText}`);
  }

  return await response.json();
}