import { useQuery } from 'react-query';
import { metricsService } from '../services/supabase/metrics';
import { METRIC_DEFINITIONS } from '../types/metrics';

export function useMetrics(siteUrl: string | null) {
  return useQuery(
    ['metrics', siteUrl],
    async () => {
      if (!siteUrl) return null;

      const metricsWithTrends = {};

      for (const metricKey of Object.keys(METRIC_DEFINITIONS)) {
        try {
          // Récupérer l'historique des métriques (les 7 derniers jours)
          const history = await metricsService.getMetricsHistory(siteUrl, metricKey, 7);
          
          if (history && history.length > 0) {
            // Trier par date décroissante pour avoir la plus récente en premier
            const sortedHistory = history.sort((a, b) => b.date.localeCompare(a.date));
            
            // La valeur actuelle est la plus récente disponible
            const current = sortedHistory[0]?.value || 0;
            // La valeur précédente est celle d'avant
            const previous = sortedHistory[1]?.value || 0;
            
            const trend = previous === 0 ? 0 : ((current - previous) / previous) * 100;

            metricsWithTrends[metricKey] = {
              value: current,
              previousValue: previous,
              trend,
              history: sortedHistory,
              lastUpdateDate: sortedHistory[0]?.date
            };
          } else {
            metricsWithTrends[metricKey] = {
              value: 0,
              previousValue: 0,
              trend: 0,
              history: [],
              lastUpdateDate: null
            };
          }
        } catch (error) {
          console.error(`Error fetching metrics for ${metricKey}:`, error);
          metricsWithTrends[metricKey] = {
            value: 0,
            previousValue: 0,
            trend: 0,
            history: [],
            lastUpdateDate: null
          };
        }
      }

      return metricsWithTrends;
    },
    {
      enabled: !!siteUrl,
      staleTime: 5 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false
    }
  );
}