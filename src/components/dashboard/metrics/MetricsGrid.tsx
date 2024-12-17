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

  // Fetch historical data for all metrics
  const { data: searchConsoleHistory } = useQuery(
    ['searchConsoleHistory', site.keys[0], dateRange],
    async () => {
      const response = await searchConsoleApi.fetchSearchAnalytics(accessToken!, site.keys[0], {
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
      const metrics = await metricsService.getMetricsHistory(site.keys[0], 'TO', 90); // Get enough history for all ranges
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

  const clicksHistory = searchConsoleHistory?.map(row => ({ 
    date: row.date, 
    value: row.clicks 
  }));
  
  const impressionsHistory = searchConsoleHistory?.map(row => ({ 
    date: row.date, 
    value: row.impressions 
  }));

  const clicksSparkline = clicksHistory?.map(item => item.value) || [];
  const impressionsSparkline = impressionsHistory?.map(item => item.value) || [];
  const organicSparkline = organicHistory?.map(item => item.value) || [];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-0.5">
      <div className="w-full cursor-pointer" onClick={() => onMetricClick('TO')}>
        <MetricBlock
          type="custom"
          label="Trafic organique"
          value={siteMetrics?.TO?.value || 0}
          color="#3b82f6"
          sparklineData={organicSparkline}
          historicalData={organicHistory}
        />
      </div>

      <div className="w-full cursor-pointer" onClick={() => onMetricClick('clicks')}>
        <MetricBlock
          type="clicks"
          value={site.clicks}
          label="Nombre de clics"
          color="#10b981"
          sparklineData={clicksSparkline}
          historicalData={clicksHistory}
        />
      </div>

      <div className="w-full cursor-pointer" onClick={() => onMetricClick('impressions')}>
        <MetricBlock
          type="impressions"
          value={site.impressions}
          label="Impressions"
          color="#8b5cf6"
          sparklineData={impressionsSparkline}
          historicalData={impressionsHistory}
        />
      </div>

      <div className="w-full cursor-pointer" onClick={() => onMetricClick('pageViews')}>
        <MetricBlock
          type="custom"
          label="Pages vues"
          value={analyticsMetrics?.pageViews || 0}
          color="#f59e0b"
          historicalData={analyticsMetrics?.pageViewsHistory}
          sparklineData={analyticsMetrics?.pageViewsHistory?.map(item => item.value)}
        />
      </div>

      <div className="w-full cursor-pointer" onClick={() => onMetricClick('activeUsers')}>
        <MetricBlock
          type="custom"
          label="Visiteurs 7j"
          value={analyticsMetrics?.activeUsers || 0}
          color="#ec4899"
          historicalData={analyticsMetrics?.activeUsersHistory}
          sparklineData={analyticsMetrics?.activeUsersHistory?.map(item => item.value)}
        />
      </div>
    </div>
  );
};