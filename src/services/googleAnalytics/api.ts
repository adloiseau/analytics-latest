import { RealTimeMetrics } from '../../types/analytics';

export const analyticsApi = {
  async getMetricsData(propertyId: string, accessToken: string): Promise<RealTimeMetrics> {
    try {
      const response = await fetch(
        `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
            metrics: [
              { name: 'activeUsers' },
              { name: 'screenPageViews' },
              { name: 'averageSessionDuration' },
              { name: 'bounceRate' }
            ]
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        activeUsers: parseInt(data.rows?.[0]?.metricValues?.[0]?.value || '0'),
        pageViews: parseInt(data.rows?.[0]?.metricValues?.[1]?.value || '0'),
        avgSessionDuration: parseFloat(data.rows?.[0]?.metricValues?.[2]?.value || '0'),
        bounceRate: parseFloat(data.rows?.[0]?.metricValues?.[3]?.value || '0')
      };
    } catch (error) {
      console.error('Error fetching Google Analytics metrics data:', error);
      throw error;
    }
  },

  async getRealTimeData(propertyId: string, accessToken: string): Promise<RealTimeMetrics> {
    try {
      const response = await fetch(
        `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            metrics: [{ name: 'activeUsers' }],
            minuteRanges: [{ 
              name: 'last29Minutes',
              startMinutesAgo: 29,
              endMinutesAgo: 0
            }]
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        activeUsers: parseInt(data.rows?.[0]?.metricValues?.[0]?.value || '0'),
        pageViews: 0,
        avgSessionDuration: 0,
        bounceRate: 0
      };
    } catch (error) {
      console.error('Error fetching Google Analytics real-time data:', error);
      throw error;
    }
  }
};