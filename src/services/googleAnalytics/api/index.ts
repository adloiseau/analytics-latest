import { RealTimeMetrics } from '../../../types/analytics';
import { DateRange } from '../../../types/filters';
import { getDateRange } from '../../../utils/dates';

export const analyticsApi = {
  async getMetricsData(
    propertyId: string, 
    accessToken: string,
    dateRange: DateRange
  ): Promise<RealTimeMetrics> {
    try {
      const { startDate, endDate } = getDateRange(dateRange);
      console.log('[GA API] Fetching metrics with dates:', { startDate, endDate });

      // Fetch historical data for current period
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
              { startDate, endDate }
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
      console.log('[GA API] Historical data response:', historicalData);

      // Calculate previous period dates
      const currentStartDate = new Date(startDate);
      const currentEndDate = new Date(endDate);
      const daysDiff = Math.ceil((currentEndDate.getTime() - currentStartDate.getTime()) / (1000 * 60 * 60 * 24));
      const previousStartDate = new Date(currentStartDate);
      const previousEndDate = new Date(currentEndDate);
      previousStartDate.setDate(previousStartDate.getDate() - daysDiff);
      previousEndDate.setDate(previousEndDate.getDate() - daysDiff);

      // Fetch data for previous period
      const previousResponse = await fetch(
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
                startDate: previousStartDate.toISOString().split('T')[0],
                endDate: previousEndDate.toISOString().split('T')[0]
              }
            ],
            dimensions: [{ name: 'date' }],
            metrics: [
              { name: 'activeUsers' },
              { name: 'screenPageViews' }
            ]
          })
        }
      );

      if (!previousResponse.ok) {
        throw new Error('Failed to fetch previous period data');
      }

      const previousData = await previousResponse.json();
      console.log('[GA API] Previous period data:', previousData);

      // Calculate totals for current period
      const currentTotals = historicalData.rows?.reduce((acc, row) => ({
        activeUsers: acc.activeUsers + parseInt(row.metricValues[0].value),
        pageViews: acc.pageViews + parseInt(row.metricValues[1].value)
      }), { activeUsers: 0, pageViews: 0 }) || { activeUsers: 0, pageViews: 0 };

      // Calculate totals for previous period
      const previousTotals = previousData.rows?.reduce((acc, row) => ({
        activeUsers: acc.activeUsers + parseInt(row.metricValues[0].value),
        pageViews: acc.pageViews + parseInt(row.metricValues[1].value)
      }), { activeUsers: 0, pageViews: 0 }) || { activeUsers: 0, pageViews: 0 };

      // Prepare history arrays
      const pageViewsHistory = historicalData.rows?.map(row => ({
        date: row.dimensionValues[0].value,
        value: parseInt(row.metricValues[1].value)
      })) || [];

      const activeUsersHistory = historicalData.rows?.map(row => ({
        date: row.dimensionValues[0].value,
        value: parseInt(row.metricValues[0].value)
      })) || [];

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
            metrics: [{ name: 'activeUsers' }]
          })
        }
      );

      if (!realtimeResponse.ok) {
        throw new Error('Failed to fetch realtime data');
      }

      const realtimeData = await realtimeResponse.json();
      const realtimeUsers = parseInt(realtimeData.rows?.[0]?.metricValues?.[0]?.value || '0');

      const result = {
        activeUsers: currentTotals.activeUsers,
        pageViews: currentTotals.pageViews,
        realtimeUsers,
        previousPeriod: previousTotals,
        pageViewsHistory,
        activeUsersHistory
      };

      console.log('[GA API] Final processed metrics:', result);
      return result;
    } catch (error) {
      console.error('[GA API] Error fetching analytics data:', error);
      throw error;
    }
  }
};