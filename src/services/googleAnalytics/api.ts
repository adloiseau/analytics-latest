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
            dateRanges: [
              { startDate: '7daysAgo', endDate: 'today' },
              { startDate: '14daysAgo', endDate: '8daysAgo' }
            ],
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const currentPeriod = data.rows?.[0]?.metricValues;
      const previousPeriod = data.rows?.[1]?.metricValues;

      return {
        activeUsers: parseInt(currentPeriod?.[0]?.value || '0'),
        pageViews: parseInt(currentPeriod?.[1]?.value || '0'),
        avgSessionDuration: parseFloat(currentPeriod?.[2]?.value || '0'),
        bounceRate: parseFloat(currentPeriod?.[3]?.value || '0'),
        previousPeriod: {
          activeUsers: parseInt(previousPeriod?.[0]?.value || '0'),
          pageViews: parseInt(previousPeriod?.[1]?.value || '0'),
          avgSessionDuration: parseFloat(previousPeriod?.[2]?.value || '0'),
          bounceRate: parseFloat(previousPeriod?.[3]?.value || '0')
        }
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
            metrics: [
              { name: 'activeUsers' }
            ]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const activeUsers = parseInt(data.rows?.[0]?.metricValues?.[0]?.value || '0');

      return {
        activeUsers,
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