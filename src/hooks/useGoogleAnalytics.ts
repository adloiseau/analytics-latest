import { useState, useEffect } from 'react';
import { gaClient } from '../services/googleAnalytics/client';
import type { RealTimeMetrics } from '../services/googleAnalytics/types';

export const useGoogleAnalytics = (websiteUrl: string) => {
  const [metrics, setMetrics] = useState<RealTimeMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await gaClient.getRealTimeData(websiteUrl);
        setMetrics(data);
        setError(null);
      } catch (err) {
        setError('Erreur lors de la récupération des données Google Analytics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Rafraîchir les données toutes les 30 secondes
    const interval = setInterval(fetchData, 30000);

    return () => clearInterval(interval);
  }, [websiteUrl]);

  return { metrics, loading, error };
};