import React from 'react';
import { MetricBlock } from '../MetricBlock';
import { calculateTrend, calculatePageViewsTrend, calculateUsersTrend } from './MetricTrends';
import { useQuery } from 'react-query';
import { metricsService } from '../../../services/supabase/metrics';
import { searchConsoleApi } from '../../../services/googleAuth/api';
import { useAuth } from '../../../contexts/AuthContext';
import { useFilters } from '../../../contexts/FilterContext';
import { getDateRange } from '../../../utils/dates';
import type { SearchAnalyticsRow } from '../../../services/googleAuth/types';
import type { SiteMetrics, AnalyticsMetrics } from '../../../types/analytics';

interface MetricsGridProps {
  site: SearchAnalyticsRow;
  previousPeriodData?: SearchAnalyticsRow;
  siteMetrics?: SiteMetrics;
  analyticsMetrics?: AnalyticsMetrics;
  onMetricClick: (metricKey: string) => void;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({
  site,
  previousPeriodData,
  siteMetrics,
  analyticsMetrics,
  onMetricClick
}) => {
  const { accessToken } = useAuth();
  const { dateRange } = useFilters();
  const { startDate, endDate } = getDateRange(dateRange);

  // Fetch historical data for sparklines
  const { data: searchConsoleHistory } = useQuery(
    ['searchConsoleHistory', site.keys[0], dateRange],
    async () => {
      const response = await searchConsoleApi.fetchSearchAnalytics(accessToken!, site.keys[0], {
        startDate,
        endDate,
        dimensions: ['date'],
        rowLimit: 1000
      });
      return response.rows || [];
    },
    {
      enabled: !!accessToken && !!site.keys[0],
      staleTime: 5 * 60 * 1000
    }
  );

  const { data: metricsHistory } = useQuery(
    ['metricsHistory', site.keys[0], dateRange],
    async () => {
      const days = dateRange === '24h' ? 2 : 
                  dateRange === '7d' ? 7 : 
                  dateRange === '28d' ? 28 : 90;
      return await metricsService.getMetricsHistory(site.keys[0], 'TO', days);
    },
    {
      enabled: !!site.keys[0],
      staleTime: 5 * 60 * 1000
    }
  );

  const clicksSparkline = searchConsoleHistory?.map(row => row.clicks) || [];
  const impressionsSparkline = searchConsoleHistory?.map(row => row.impressions) || [];
  const toSparkline = metricsHistory?.map(item => item.value) || [];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-0.5">
      <div className="w-full cursor-pointer" onClick={() => onMetricClick('TO')}>
        <MetricBlock
          type="custom"
          label="Trafic organique"
          value={siteMetrics?.TO?.value || 0}
          trend={siteMetrics?.TO?.trend || 0}
          color="#3b82f6"
          sparklineData={toSparkline}
        />
      </div>

      <div className="w-full cursor-pointer" onClick={() => onMetricClick('clicks')}>
        <MetricBlock
          type="clicks"
          value={site.clicks}
          trend={calculateTrend(site.clicks, previousPeriodData?.clicks || 0)}
          label="Nombre de clics"
          color="#10b981"
          sparklineData={clicksSparkline}
        />
      </div>

      <div className="w-full cursor-pointer" onClick={() => onMetricClick('impressions')}>
        <MetricBlock
          type="impressions"
          value={site.impressions}
          trend={calculateTrend(site.impressions, previousPeriodData?.impressions || 0)}
          label="Impressions"
          color="#8b5cf6"
          sparklineData={impressionsSparkline}
        />
      </div>

      <div className="w-full cursor-pointer" onClick={() => onMetricClick('pageViews')}>
        <MetricBlock
          type="custom"
          label="Pages vues"
          value={analyticsMetrics?.pageViews || 0}
          trend={calculatePageViewsTrend(analyticsMetrics)}
          color="#f59e0b"
        />
      </div>

      <div className="w-full cursor-pointer" onClick={() => onMetricClick('activeUsers')}>
        <MetricBlock
          type="custom"
          label="Visiteurs 7j"
          value={analyticsMetrics?.activeUsers || 0}
          trend={calculateUsersTrend(analyticsMetrics)}
          color="#ec4899"
        />
      </div>
    </div>
  );
};