import { RealTimeMetrics } from '../../../types/analytics';
import { DateRange } from '../../../types/filters';
import { fetchPeriodData } from './fetchPeriodData';
import { processSourceData } from './processSourceData';

export const analyticsApi = {
  async getMetricsData(propertyId: string, accessToken: string, dateRange: DateRange): Promise<RealTimeMetrics> {
    try {
      // Fetch current period data
      const currentPeriodData = await fetchPeriodData(propertyId, accessToken, dateRange);
      const processedData = processSourceData(currentPeriodData);

      // Fetch realtime data
      const realtimeResponse = await fetch(
        `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            minuteRanges: [{ 
              name: 'last29min',
              startMinutesAgo: 29,
              endMinutesAgo: 0
            }],
            metrics: [{ name: 'activeUsers' }]
          })
        }
      );

      if (!realtimeResponse.ok) {
        throw new Error('Failed to fetch realtime data');
      }

      const realtimeData = await realtimeResponse.json();
      const realtimeUsers = parseInt(realtimeData.rows?.[0]?.metricValues?.[0]?.value || '0');

      return {
        ...processedData,
        realtimeUsers
      };
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      throw error;
    }
  }
};