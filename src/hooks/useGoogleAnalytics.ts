import { useState, useEffect } from 'react';
import { analyticsApi } from '../services/googleAnalytics/api';
import { useAuth } from '../contexts/AuthContext';
import { GA_PROPERTY_IDS } from '../config/analytics.config';
import type { RealTimeMetrics } from '../types/analytics';

export const useGoogleAnalytics = (websiteUrl: string) => {
  const [metrics, setMetrics] = useState<RealTimeMetrics | null>(null);
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
        const data = await analyticsApi.getRealTimeData(propertyId, accessToken);
        setMetrics(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching Google Analytics data:', err);
        setError('Erreur lors de la récupération des données Google Analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);

    return () => clearInterval(interval);
  }, [websiteUrl, accessToken]);

  return { metrics, loading, error };
};