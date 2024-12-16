import { useState, useEffect } from 'react';
import { analyticsApi } from '../services/googleAnalytics/api';
import { useAuth } from '../contexts/AuthContext';
import { GA_PROPERTY_IDS } from '../config/analytics.config';
import { REFRESH_CONFIG } from '../config/refresh';
import type { RealTimeMetrics } from '../types/analytics';

export const useGoogleAnalytics = (websiteUrl: string) => {
  const [metrics, setMetrics] = useState<RealTimeMetrics | null>(null);
  const [realtimeMetrics, setRealtimeMetrics] = useState<RealTimeMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { accessToken } = useAuth();

  useEffect(() => {
    if (!accessToken || !websiteUrl) return;

    const hostname = new URL(websiteUrl).hostname;
    const propertyId = GA_PROPERTY_IDS[hostname];
    
    if (!propertyId) {
      setError('Property ID non trouvé pour ce site');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [metricsData, realtimeData] = await Promise.all([
          analyticsApi.getMetricsData(propertyId, accessToken),
          analyticsApi.getRealTimeData(propertyId, accessToken)
        ]);
        
        setMetrics(metricsData);
        setRealtimeMetrics(realtimeData);
        setError(null);
      } catch (err) {
        console.error('Error fetching Google Analytics data:', err);
        setError('Erreur lors de la récupération des données Google Analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Refresh intervals for different types of data
    const metricsInterval = setInterval(fetchData, REFRESH_CONFIG.GA_REFRESH_INTERVAL);
    const realtimeInterval = setInterval(fetchData, REFRESH_CONFIG.GA_REALTIME_REFRESH_INTERVAL);

    return () => {
      clearInterval(metricsInterval);
      clearInterval(realtimeInterval);
    };
  }, [websiteUrl, accessToken]);

  return { metrics, realtimeMetrics, loading, error };
};