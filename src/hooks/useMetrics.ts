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
          const history = await metricsService.getMetricsHistory(siteUrl, metricKey, 2);
          
          if (history && history.length > 0) {
            const current = history[0]?.value || 0;
            const previous = history[1]?.value || 0;
            const trend = previous === 0 ? 0 : ((current - previous) / previous) * 100;

            metricsWithTrends[metricKey] = {
              value: current,
              trend
            };
          } else {
            metricsWithTrends[metricKey] = {
              value: 0,
              trend: 0
            };
          }
        } catch (error) {
          console.error(`Error fetching metrics for ${metricKey}:`, error);
          metricsWithTrends[metricKey] = {
            value: 0,
            trend: 0
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