import { useState, useEffect } from 'react';
import { analyticsApi } from '../services/googleAnalytics/api';
import { useAuth } from '../contexts/AuthContext';
import { useFilters } from '../contexts/FilterContext';
import { GA_PROPERTY_IDS } from '../config/analytics.config';
import { REFRESH_CONFIG } from '../config/refresh';
import { getDateRange } from '../utils/dates';
import { format, parseISO, subDays } from 'date-fns';
import type { RealTimeMetrics } from '../types/analytics';

export function useGoogleAnalytics(websiteUrl: string) {
  const [metrics, setMetrics] = useState<RealTimeMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { accessToken, isAuthenticated } = useAuth();
  const { dateRange } = useFilters();

  useEffect(() => {
    if (!isAuthenticated || !accessToken || !websiteUrl) {
      setLoading(false);
      return;
    }

    const hostname = new URL(websiteUrl).hostname;
    const propertyId = GA_PROPERTY_IDS[hostname];
    
    if (!propertyId) {
      setError('Property ID non trouvé pour ce site');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch metrics data with the current date range
        const dateRangeObj = getDateRange(dateRange);
        const metricsData = await analyticsApi.getMetricsData(
          propertyId,
          accessToken,
          dateRangeObj
        );

        // Correct calculation of previous period dates
        const currentStartDate = parseISO(dateRangeObj.startDate);
        const currentEndDate = parseISO(dateRangeObj.endDate);
        const daysDiff = Math.ceil((currentEndDate.getTime() - currentStartDate.getTime()) / (1000 * 60 * 60 * 24));

        const previousStartDate = format(subDays(currentStartDate, daysDiff), 'yyyy-MM-dd');
        const previousEndDate = format(subDays(currentEndDate, daysDiff), 'yyyy-MM-dd');

        const previousPeriodData = await analyticsApi.getMetricsData(
          propertyId,
          accessToken,
          {
            startDate: previousStartDate,
            endDate: previousEndDate
          }
        );

        // Update metrics with historical data
        const historicalData = await analyticsApi.getHistoricalData(propertyId, accessToken, dateRangeObj);
        setMetrics(prev => prev ? {
          ...prev,
          pageViewsHistory: historicalData.pageViewsHistory,
          activeUsersHistory: historicalData.activeUsersHistory,
          previousPageViewsHistory: previousPeriodData.pageViewsHistory,
          previousActiveUsersHistory: previousPeriodData.activeUsersHistory
        } : {
          ...metricsData,
          pageViewsHistory: historicalData.pageViewsHistory,
          activeUsersHistory: historicalData.activeUsersHistory,
          previousPageViewsHistory: previousPeriodData.pageViewsHistory,
          previousActiveUsersHistory: previousPeriodData.activeUsersHistory
        });
        setError(null);
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Erreur lors de la récupération des données Google Analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up realtime data refresh
    const realtimeInterval = setInterval(async () => {
      if (!metrics) return;

      try {
        const realtimeData = await analyticsApi.getRealtimeData(
          propertyId,
          accessToken
        );

        setMetrics(prev => prev ? {
          ...prev,
          realtimeUsers: realtimeData.realtimeUsers
        } : null);
      } catch (error) {
        console.error('Error updating realtime data:', error);
      }
    }, REFRESH_CONFIG.GA_REALTIME_REFRESH_INTERVAL);

    return () => {
      clearInterval(realtimeInterval);
    };
  }, [websiteUrl, accessToken, isAuthenticated, dateRange]); // Added dateRange to dependencies

  return { metrics, loading, error };
}