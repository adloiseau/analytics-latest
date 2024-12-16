import { useQuery } from 'react-query';
import { metricsService } from '../services/supabase/metrics';
import { METRIC_DEFINITIONS } from '../types/metrics';

export const useMetrics = (siteUrl: string | null) => {
  return useQuery(
    ['metrics', siteUrl],
    async () => {
      if (!siteUrl) return null;

      // Test connection first
      const isConnected = await metricsService.testConnection();
      if (!isConnected) {
        throw new Error('Could not connect to Supabase');
      }

      console.log('Starting metrics fetch for site:', siteUrl);
      const metricsWithTrends = {};

      for (const metricKey of Object.keys(METRIC_DEFINITIONS)) {
        try {
          console.log(`Fetching metric ${metricKey} for site ${siteUrl}`);
          const history = await metricsService.getMetricsHistory(siteUrl, metricKey, 2);
          
          if (history && history.length > 0) {
            console.log(`History for ${metricKey}:`, history);
            const current = history[0]?.value || 0;
            const previous = history[1]?.value || 0;
            const trend = previous === 0 ? 0 : ((current - previous) / previous) * 100;

            console.log(`${metricKey} values:`, { current, previous, trend });
            metricsWithTrends[metricKey] = {
              value: current,
              trend
            };
          } else {
            console.log(`No history found for metric ${metricKey}`);
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

      console.log('Final metrics with trends:', metricsWithTrends);
      return metricsWithTrends;
    },
    {
      enabled: !!siteUrl,
      staleTime: 5 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false
    }
  );
};