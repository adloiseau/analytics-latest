import { RealTimeMetrics } from '../../types/analytics';
import { format, subDays } from 'date-fns';

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

      const data = await response.json();
      const currentPeriod = data.rows?.[0]?.metricValues;
      const previousPeriod = data.rows?.[1]?.metricValues;

      return {
        activeUsers: parseInt(currentPeriod?.[0]?.value || '0'),
        pageViews: parseInt(currentPeriod?.[1]?.value || '0'),
        previousPeriod: {
          activeUsers: parseInt(previousPeriod?.[0]?.value || '0'),
          pageViews: parseInt(previousPeriod?.[1]?.value || '0')
        },
        pageViewsHistory,
        activeUsersHistory
      };
    } catch (error) {
      throw error;
    }
  },

  // ... reste du code inchangé
};