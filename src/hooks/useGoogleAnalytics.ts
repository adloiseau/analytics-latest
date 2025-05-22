import { useState, useEffect, useCallback } from 'react';
import { analyticsApi } from '../services/googleAnalytics/api';
import { useAuth } from '../contexts/AuthContext';
import { useFilters } from '../contexts/FilterContext';
import { GA_PROPERTY_IDS, isAuthorizedSite } from '../config/analytics.config';
import { REFRESH_CONFIG } from '../config/refresh';
import { getDateRange } from '../utils/dates';
import type { RealTimeMetrics } from '../types/analytics';

export function useGoogleAnalytics(websiteUrl: string) {
  const [metrics, setMetrics] = useState<RealTimeMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { accessToken, isAuthenticated } = useAuth();
  const { dateRange } = useFilters();

  const fetchData = useCallback(async () => {
    if (!isAuthenticated || !accessToken || !websiteUrl) {
      setLoading(false);
      return;
    }

    try {
      // Check if site is authorized
      if (!isAuthorizedSite(websiteUrl)) {
        setMetrics(null);
        setLoading(false);
        return;
      }

      const hostname = new URL(websiteUrl).hostname;
      const propertyId = GA_PROPERTY_IDS[hostname];
      
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
  }, [websiteUrl, accessToken, isAuthenticated, dateRange]);

  useEffect(() => {
    fetchData();

    // Set up refresh interval for real-time data
    if (isAuthenticated && websiteUrl && isAuthorizedSite(websiteUrl)) {
      const interval = setInterval(fetchData, REFRESH_CONFIG.GA_REALTIME_REFRESH_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [fetchData, isAuthenticated, websiteUrl]);

  return { metrics, loading, error };
}