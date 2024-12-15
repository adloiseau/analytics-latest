import type { RealTimeMetrics } from '../../types/analytics';

export const analyticsApi = {
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
              { name: 'activeUsers' },
              { name: 'screenPageViews' },
              { name: 'eventCount' },
              { name: 'conversions' }
            ],
            minuteRanges: [{ 
              startMinutesAgo: 25,
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
      
      // Extraire les métriques de la réponse
      const row = data.rows?.[0]?.metricValues || [];
      
      return {
        activeUsers: parseInt(row[0]?.value || '0'),
        pageViews: parseInt(row[1]?.value || '0'),
        avgSessionDuration: parseInt(row[2]?.value || '0'),
        bounceRate: parseFloat(row[3]?.value || '0')
      };
    } catch (error) {
      console.error('Error fetching Google Analytics data:', error);
      throw error;
    }
  }
};