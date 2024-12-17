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

  // Prepare historical data for each metric
  const clicksHistory = searchConsoleHistory?.current.map(row => ({
    date: row.date,
    value: row.clicks
  }));

  const impressionsHistory = searchConsoleHistory?.current.map(row => ({
    date: row.date,
    value: row.impressions
  }));

  // Prepare sparkline data
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

      <div className="w-full cursor-pointer" onClick={() => onMetricClick('realtimeUsers')}>
        <MetricBlock
          type="custom"
          label="Visiteurs 30m"
          value={analyticsMetrics?.realtimeUsers || 0}
          color="#ec4899"
          historicalData={analyticsMetrics?.activeUsersHistory}
          sparklineData={analyticsMetrics?.activeUsersHistory?.map(item => item.value)}
        />
      </div>
    </div>
  );
};