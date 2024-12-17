import { RealTimeMetrics } from '../../../types/analytics';

export const analyticsApi = {
  async getMetricsData(propertyId: string, accessToken: string): Promise<RealTimeMetrics> {
    try {
      // Récupérer les données historiques pour les 30 derniers jours
      const historicalResponse = await fetch(
        `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dateRanges: [
              { startDate: '30daysAgo', endDate: 'today' }
            ],
            dimensions: [{ name: 'date' }],
            metrics: [
              { name: 'activeUsers' },
              { name: 'screenPageViews' }
            ]
          })
        }
      );

      if (!historicalResponse.ok) {
        throw new Error('Failed to fetch historical data');
      }

      const historicalData = await historicalResponse.json();
      
      // Transformer les données historiques
      const pageViewsHistory = historicalData.rows?.map(row => ({
        date: row.dimensionValues[0].value,
        value: parseInt(row.metricValues[1].value)
      })) || [];

      const activeUsersHistory = historicalData.rows?.map(row => ({
        date: row.dimensionValues[0].value,
        value: parseInt(row.metricValues[0].value)
      })) || [];

      // Récupérer les données actuelles vs période précédente
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
              { name: 'screenPageViews' }
            ]
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch current data');
      }

      const data = await response.json();
      const currentPeriod = data.rows?.[0]?.metricValues;
      const previousPeriod = data.rows?.[1]?.metricValues;

      // Récupérer les données en temps réel (29 minutes)
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
        activeUsers: parseInt(currentPeriod?.[0]?.value || '0'),
        pageViews: parseInt(currentPeriod?.[1]?.value || '0'),
        realtimeUsers,
        previousPeriod: {
          activeUsers: parseInt(previousPeriod?.[0]?.value || '0'),
          pageViews: parseInt(previousPeriod?.[1]?.value || '0')
        },
        pageViewsHistory,
        activeUsersHistory
      };
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      throw error;
    }
  }
};