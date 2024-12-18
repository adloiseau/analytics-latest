import { RealTimeMetrics } from '../../types/analytics';
import { getTrafficSourceData } from './api/getTrafficSourceData';
import { format, subDays, parseISO } from 'date-fns';

export const analyticsApi = {
  getTrafficSourceData,
  async getMetricsData(propertyId: string, accessToken: string, dateRange: { startDate: string, endDate: string }): Promise<RealTimeMetrics> {
    try {
      if (!dateRange.startDate || !dateRange.endDate) {
        throw new Error('Invalid date range provided');
      }

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
              { startDate: dateRange.startDate, endDate: dateRange.endDate }
            ],
            dimensions: [{ name: 'date' }],
            metrics: [
              { name: 'activeUsers' },
              { name: 'screenPageViews' }
            ],
            limit: 1000
          })
        }
      );

      if (!historicalResponse.ok) {
        throw new Error('Failed to fetch historical data');
      }

      const historicalData = await historicalResponse.json();

      // Calculate previous period dates safely using date-fns
      const currentStartDate = parseISO(dateRange.startDate);
      const currentEndDate = parseISO(dateRange.endDate);
      const daysDiff = Math.ceil((currentEndDate.getTime() - currentStartDate.getTime()) / (1000 * 60 * 60 * 24));
      const previousStartDate = format(subDays(currentStartDate, daysDiff), 'yyyy-MM-dd');
      const previousEndDate = format(subDays(currentEndDate, daysDiff), 'yyyy-MM-dd');

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
                startDate: previousStartDate,
                endDate: previousEndDate
              }
            ],
            dimensions: [{ name: 'date' }],
            metrics: [
              { name: 'activeUsers' },
              { name: 'screenPageViews' }
            ],
            limit: 1000
          })
        }
      );

      if (!previousResponse.ok) {
        throw new Error('Failed to fetch previous period data');
      }

      const previousData = await previousResponse.json();

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

      // Prepare history arrays with proper date alignment
      const pageViewsHistory = historicalData.rows?.map(row => ({
        date: row.dimensionValues[0].value,
        value: parseInt(row.metricValues[1].value)
      })).sort((a, b) => a.date.localeCompare(b.date)) || [];

      const activeUsersHistory = historicalData.rows?.map(row => ({
        date: row.dimensionValues[0].value,
        value: parseInt(row.metricValues[0].value)
      })).sort((a, b) => a.date.localeCompare(b.date)) || [];

      // Prepare previous period history with aligned dates
      const previousPageViewsHistory = previousData.rows?.map(row => ({
        date: format(subDays(parseISO(row.dimensionValues[0].value), -daysDiff), 'yyyy-MM-dd'),
        value: parseInt(row.metricValues[1].value)
      })).sort((a, b) => a.date.localeCompare(b.date)) || [];

      const previousActiveUsersHistory = previousData.rows?.map(row => ({
        date: format(subDays(parseISO(row.dimensionValues[0].value), -daysDiff), 'yyyy-MM-dd'),
        value: parseInt(row.metricValues[0].value)
      })).sort((a, b) => a.date.localeCompare(b.date)) || [];

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

      return {
        activeUsers: currentTotals.activeUsers,
        pageViews: currentTotals.pageViews,
        realtimeUsers,
        previousPeriod: previousTotals,
        pageViewsHistory,
        activeUsersHistory,
        previousPageViewsHistory,
        previousActiveUsersHistory
      };
    } catch (error) {
      console.error('[GA API] Error fetching analytics data:', error);
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
          ],
          limit: 1000
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
    })).sort((a, b) => a.date.localeCompare(b.date)) || [];

    const activeUsersHistory = historicalData.rows?.map(row => ({
      date: row.dimensionValues[0].value,
      value: parseInt(row.metricValues[0].value)
    })).sort((a, b) => a.date.localeCompare(b.date)) || [];

    return { pageViewsHistory, activeUsersHistory };
  },
};