import { useState, useEffect, useCallback } from 'react';
import { analyticsApi } from '../services/googleAnalytics/api';
import { useAuth } from '../contexts/AuthContext';
import { useFilters } from '../contexts/FilterContext';
import { useGAPropertiesMap } from './useGAProperties';
import { REFRESH_CONFIG } from '../config/refresh';
import { getDateRange } from '../utils/dates';
import type { RealTimeMetrics } from '../types/analytics';

export function useGoogleAnalytics(websiteUrl: string) {
  const [metrics, setMetrics] = useState<RealTimeMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { accessToken, isAuthenticated } = useAuth();
  const { dateRange } = useFilters();
  const { data: gaPropertiesMap } = useGAPropertiesMap();

  const fetchData = useCallback(async () => {
    if (!isAuthenticated || !accessToken || !websiteUrl || !gaPropertiesMap) {
      setLoading(false);
      return;
    }

    try {
      const hostname = new URL(websiteUrl).hostname;
      const propertyId = gaPropertiesMap[hostname];
      
      if (!propertyId) {
        setMetrics(null);
        setLoading(false);
        return;
      }

      const dateRangeObj = getDateRange(dateRange);
      const metricsData = await analyticsApi.getMetricsData(
        propertyId,
        accessToken,
        dateRangeObj
      );

      setMetrics(metricsData);
      setError(null);
    } catch (err) {
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  }, [websiteUrl, accessToken, isAuthenticated, dateRange, gaPropertiesMap]);

  useEffect(() => {
    fetchData();

    // Set up refresh interval for real-time data
    if (isAuthenticated && websiteUrl && gaPropertiesMap) {
      const hostname = new URL(websiteUrl).hostname;
      if (gaPropertiesMap[hostname]) {
        const interval = setInterval(fetchData, REFRESH_CONFIG.GA_REALTIME_REFRESH_INTERVAL);
        return () => clearInterval(interval);
      }
    }
  }, [fetchData, isAuthenticated, websiteUrl, gaPropertiesMap]);

  return { metrics, loading, error };
}