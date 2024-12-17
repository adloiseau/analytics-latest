import React from 'react';
import { MetricBlock } from '../MetricBlock';
import { useQuery } from 'react-query';
import { metricsService } from '../../../services/supabase/metrics';
import { searchConsoleApi } from '../../../services/googleAuth/api';
import { useAuth } from '../../../contexts/AuthContext';
import { useFilters } from '../../../contexts/FilterContext';
import { getDateRange } from '../../../utils/dates';
import { subDays, format } from 'date-fns';
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
  previousPeriodData,
  siteMetrics,
  analyticsMetrics,
  onMetricClick
}) => {
  const { accessToken } = useAuth();
  const { dateRange } = useFilters();
  const { startDate, endDate } = getDateRange(dateRange);

  // Calculate previous period dates
  const currentStartDate = new Date(startDate);
  const currentEndDate = new Date(endDate);
  const daysDiff = Math.ceil((currentEndDate.getTime() - currentStartDate.getTime()) / (1000 * 60 * 60 * 24));
  const previousStartDate = format(subDays(currentStartDate, daysDiff), 'yyyy-MM-dd');
  const previousEndDate = format(subDays(currentEndDate, daysDiff), 'yyyy-MM-dd');

  // Fetch historical data for current and previous periods
  const { data: searchConsoleHistory } = useQuery(
    ['searchConsoleHistory', site.keys[0], startDate, endDate],
    async () => {
      const [currentPeriod, previousPeriod] = await Promise.all([
        searchConsoleApi.fetchSearchAnalytics(accessToken!, site.keys[0], {
          startDate,
          endDate,
          dimensions: ['date'],
          rowLimit: 1000
        }),
        searchConsoleApi.fetchSearchAnalytics(accessToken!, site.keys[0], {
          startDate: previousStartDate,
          endDate: previousEndDate,
          dimensions: ['date'],
          rowLimit: 1000
        })
      ]);

      return {
        current: currentPeriod.rows?.map(row => ({
          date: row.keys[0],
          clicks: row.clicks,
          impressions: row.impressions
        })) || [],
        previous: previousPeriod.rows?.map(row => ({
          date: row.keys[0],
          clicks: row.clicks,
          impressions: row.impressions
        })) || []
      };
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

  // Prepare historical data for each metric
  const clicksHistory = searchConsoleHistory?.current.map(row => ({
    date: row.date,
    value: row.clicks
  }));

  const impressionsHistory = searchConsoleHistory?.current.map(row => ({
    date: row.date,
    value: row.impressions
  }));

  // Include previous period data
  const allClicksHistory = [
    ...(searchConsoleHistory?.previous || []).map(row => ({
      date: row.date,
      value: row.clicks
    })),
    ...(clicksHistory || [])
  ];

  const allImpressionsHistory = [
    ...(searchConsoleHistory?.previous || []).map(row => ({
      date: row.date,
      value: row.impressions
    })),
    ...(impressionsHistory || [])
  ];

  // Prepare sparkline data
  const clicksSparkline = clicksHistory?.map(item => item.value) || [];
  const impressionsSparkline = impressionsHistory?.map(item => item.value) || [];
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
        />
      </div>

      <div className="w-full cursor-pointer" onClick={() => onMetricClick('clicks')}>
        <MetricBlock
          type="clicks"
          value={site.clicks}
          label="Nombre de clics"
          color="#10b981"
          sparklineData={clicksSparkline}
          historicalData={allClicksHistory}
        />
      </div>

      <div className="w-full cursor-pointer" onClick={() => onMetricClick('impressions')}>
        <MetricBlock
          type="impressions"
          value={site.impressions}
          label="Impressions"
          color="#8b5cf6"
          sparklineData={impressionsSparkline}
          historicalData={allImpressionsHistory}
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

      <div className="w-full cursor-pointer" onClick={() => onMetricClick('realtimeUsers')}>
        <MetricBlock
          type="custom"
          label="Visiteurs 30m"
          value={analyticsMetrics?.realtimeUsers || 0}
          color="#06b6d4"
          tooltip="Nombre de visiteurs actifs sur les 30 dernières minutes"
        />
      </div>
    </div>
  );
};