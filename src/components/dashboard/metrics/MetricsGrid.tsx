import React from 'react';
import { MetricBlock } from '../MetricBlock';
import { useQuery } from 'react-query';
import { metricsService } from '../../../services/supabase/metrics';
import { searchConsoleApi } from '../../../services/googleAuth/api';
import { useAuth } from '../../../contexts/AuthContext';
import { useFilters } from '../../../contexts/FilterContext';
import { getDateRange } from '../../../utils/dates';
import type { SearchAnalyticsRow } from '../../../services/googleAuth/types';
import type { AnalyticsMetrics } from '../../../types/analytics';

interface MetricsGridProps {
  site: SearchAnalyticsRow;
  previousPeriodData?: SearchAnalyticsRow;
  siteMetrics?: any;
  analyticsMetrics?: AnalyticsMetrics;
  onMetricClick: (metricKey: string) => void;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({
  site,
  siteMetrics,
  analyticsMetrics,
  onMetricClick
}) => {
  const { accessToken } = useAuth();
  const { dateRange } = useFilters();
  const { startDate, endDate } = getDateRange(dateRange);

  // Fetch historical data for Search Console metrics
  const { data: searchConsoleHistory } = useQuery(
    ['searchConsoleHistory', site.keys[0], startDate, endDate],
    async () => {
      if (!accessToken) return null;
      
      const response = await searchConsoleApi.fetchSearchAnalytics(accessToken, site.keys[0], {
        startDate,
        endDate,
        dimensions: ['date'],
        rowLimit: 1000
      });

      return response.rows?.map(row => ({
        date: row.keys[0],
        clicks: row.clicks,
        impressions: row.impressions
      })) || [];
    },
    {
      enabled: !!accessToken && !!site.keys[0],
      staleTime: 5 * 60 * 1000
    }
  );

  // Fetch organic traffic history
  const { data: organicHistory } = useQuery(
    ['organicHistory', site.keys[0], dateRange],
    async () => {
      const metrics = await metricsService.getMetricsHistory(site.keys[0], 'TO', 90);
      return metrics.map(metric => ({
        date: metric.date,
        value: metric.value
      }));
    },
    {
      enabled: !!site.keys[0],
      staleTime: 5 * 60 * 1000
    }
  );

  // Prepare sparkline data for GSC metrics
  const clicksSparkline = searchConsoleHistory?.map(item => item.clicks) || [];
  const impressionsSparkline = searchConsoleHistory?.map(item => item.impressions) || [];
  const organicSparkline = organicHistory?.map(item => item.value) || [];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-0.5">
      <div className="w-full cursor-pointer" onClick={() => onMetricClick('TO')}>
        <MetricBlock
          type="custom"
          label="Trafic organique"
          value={siteMetrics?.TO?.value || 0}
          color="#3b82f6"
          sparklineData={organicSparkline}
          historicalData={organicHistory}
          isGAMetric={false}
        />
      </div>

      <div className="w-full cursor-pointer" onClick={() => onMetricClick('clicks')}>
        <MetricBlock
          type="clicks"
          value={site.clicks}
          label="Nombre de clics"
          color="#10b981"
          sparklineData={clicksSparkline}
          historicalData={searchConsoleHistory?.map(item => ({ date: item.date, value: item.clicks }))}
          isGAMetric={false}
        />
      </div>

      <div className="w-full cursor-pointer" onClick={() => onMetricClick('impressions')}>
        <MetricBlock
          type="impressions"
          value={site.impressions}
          label="Impressions"
          color="#8b5cf6"
          sparklineData={impressionsSparkline}
          historicalData={searchConsoleHistory?.map(item => ({ date: item.date, value: item.impressions }))}
          isGAMetric={false}
        />
      </div>

      <div className="w-full cursor-pointer" onClick={() => onMetricClick('KD')}>
        <MetricBlock
          type="custom"
          label="Keywords"
          value={siteMetrics?.KD?.value || 0}
          color="#f59e0b"
          historicalData={siteMetrics?.KD?.history}
          sparklineData={siteMetrics?.KD?.history?.map(item => item.value)}
          isGAMetric={false}
        />
      </div>

      <div className="w-full cursor-pointer" onClick={() => onMetricClick('activeUsers')}>
        <MetricBlock
          type="custom"
          label="Utilisateurs actifs"
          value={analyticsMetrics?.activeUsers || 0}
          color="#ec4899"
          historicalData={analyticsMetrics?.activeUsersHistory}
          sparklineData={analyticsMetrics?.activeUsersHistory?.map(item => item.value)}
          isGAMetric={true}
        />
      </div>

      <div className="w-full cursor-pointer" onClick={() => onMetricClick('realtimeUsers')}>
        <MetricBlock
          type="custom"
          label="Visiteurs 30m"
          value={analyticsMetrics?.realtimeUsers || 0}
          color="#06b6d4"
          tooltip="Nombre de visiteurs actifs sur les 30 dernières minutes"
          isGAMetric={true}
        />
      </div>
    </div>
  );
};