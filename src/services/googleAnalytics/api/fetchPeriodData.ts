import { AnalyticsApiResponse } from '../types';
import { DateRange } from '../../../types/filters';
import { getDateRange } from '../../../utils/dates';

export async function fetchPeriodData(
  propertyId: string, 
  accessToken: string,
  dateRange: DateRange
): Promise<AnalyticsApiResponse> {
  const { startDate, endDate } = getDateRange(dateRange);
  
  // Calculate previous period dates
  const currentStartDate = new Date(startDate);
  const currentEndDate = new Date(endDate);
  const daysDiff = Math.ceil((currentEndDate.getTime() - currentStartDate.getTime()) / (1000 * 60 * 60 * 24));
  const previousStartDate = new Date(currentStartDate);
  const previousEndDate = new Date(currentEndDate);
  previousStartDate.setDate(previousStartDate.getDate() - daysDiff);
  previousEndDate.setDate(previousEndDate.getDate() - daysDiff);

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
          { 
            startDate,
            endDate
          },
          {
            startDate: previousStartDate.toISOString().split('T')[0],
            endDate: previousEndDate.toISOString().split('T')[0]
          }
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