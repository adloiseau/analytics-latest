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

        // Get date range based on selected filter
        const dateRangeObj = getDateRange(dateRange);

        // Calculate previous period dates
        const currentStartDate = parseISO(dateRangeObj.startDate);
        const currentEndDate = parseISO(dateRangeObj.endDate);
        const daysDiff = Math.ceil((currentEndDate.getTime() - currentStartDate.getTime()) / (1000 * 60 * 60 * 24));
        const previousStartDate = format(subDays(currentStartDate, daysDiff), 'yyyy-MM-dd');
        const previousEndDate = format(subDays(currentEndDate, daysDiff), 'yyyy-MM-dd');

        // Fetch current period data
        const metricsData = await analyticsApi.getMetricsData(
          propertyId,
          accessToken,
          dateRangeObj
        );

        // Fetch previous period data
        const previousPeriodData = await analyticsApi.getHistoricalData(
          propertyId,
          accessToken,
          {
            startDate: previousStartDate,
            endDate: previousEndDate
          }
        );

        // Update metrics with both current and previous period data
        setMetrics(prev => ({
          ...prev,
          ...metricsData,
          pageViewsHistory: metricsData.pageViewsHistory,
          activeUsersHistory: metricsData.activeUsersHistory,
          previousPageViewsHistory: previousPeriodData.pageViewsHistory,
          previousActiveUsersHistory: previousPeriodData.activeUsersHistory
        }));

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
  }, [websiteUrl, accessToken, isAuthenticated, dateRange]);

  return { metrics, loading, error };
}