import { RealTimeMetrics } from '../../types/analytics';
import { getTrafficSourceData } from './api/getTrafficSourceData';

export const analyticsApi = {
  getTrafficSourceData,
  async getMetricsData(propertyId: string, accessToken: string, dateRange: { startDate: string, endDate: string }): Promise<RealTimeMetrics> {
    try {
      // Validate date range
      if (!dateRange.startDate || !dateRange.endDate) {
        throw new Error('Invalid date range provided');
      }

      // Utiliser la plage de dates fournie
      const { pageViewsHistory, activeUsersHistory } = await analyticsApi.getHistoricalData(propertyId, accessToken, dateRange);

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
              { startDate: dateRange.startDate, endDate: dateRange.endDate },
              { startDate: dateRange.startDate, endDate: dateRange.endDate }
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

      // Récupérer les données en temps réel (30 dernières minutes)
      const realtimeResponse = await fetch(
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
      throw error;
    }
  },

  async getHistoricalData(propertyId: string, accessToken: string, dateRange: { startDate: string, endDate: string }): Promise<{ pageViewsHistory: any[], activeUsersHistory: any[] }> {
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
            { startDate: dateRange.startDate, endDate: dateRange.endDate }
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
    
    const pageViewsHistory = historicalData.rows?.map(row => ({
      date: row.dimensionValues[0].value,
      value: parseInt(row.metricValues[1].value)
    })) || [];

    const activeUsersHistory = historicalData.rows?.map(row => ({
      date: row.dimensionValues[0].value,
      value: parseInt(row.metricValues[0].value)
    })) || [];

    return { pageViewsHistory, activeUsersHistory };
  },
};