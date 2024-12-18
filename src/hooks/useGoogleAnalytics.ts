import { useState, useEffect } from 'react';
import { analyticsApi } from '../services/googleAnalytics/api';
import { useAuth } from '../contexts/AuthContext';
import { useFilters } from '../contexts/FilterContext';
import { GA_PROPERTY_IDS } from '../config/analytics.config';
import { REFRESH_CONFIG } from '../config/refresh';
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
        const metricsData = await analyticsApi.getMetricsData(propertyId, accessToken, dateRange);
        setMetrics(metricsData);
        setError(null);
      } catch (err) {
        setError('Erreur lors de la récupération des données Google Analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Only set up intervals for realtime data
    const realtimeInterval = setInterval(async () => {
      try {
        const metricsData = await analyticsApi.getMetricsData(propertyId, accessToken, dateRange);
        setMetrics(prev => ({
          ...prev!,
          realtimeUsers: metricsData.realtimeUsers
        }));
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