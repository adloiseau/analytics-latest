import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useMetrics } from '../../hooks/useMetrics';
import { useGoogleAnalytics } from '../../hooks/useGoogleAnalytics';
import { validateUrl } from '../../utils/metrics';
import { SiteMetricsPopup } from './SiteMetricsPopup';
import { MetricHistoryPopup } from './MetricHistoryPopup';
import { AnalyticsHistoryPopup } from './AnalyticsHistoryPopup';
import { METRIC_DEFINITIONS } from '../../types/metrics';
import { SiteHeader } from './site/SiteHeader';
import { MetricsGrid } from './metrics/MetricsGrid';
import type { SearchAnalyticsRow } from '../../services/googleAuth/types';

interface SiteMetricsRowProps {
  site: SearchAnalyticsRow;
  previousPeriodData?: SearchAnalyticsRow;
}

export const SiteMetricsRow: React.FC<SiteMetricsRowProps> = ({ site, previousPeriodData }) => {
  const [showMetricsPopup, setShowMetricsPopup] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const { metrics } = useGoogleAnalytics(site.keys[0]);
  const { data: siteMetrics } = useMetrics(site.keys[0]);

  if (!validateUrl(site.keys[0])) return null;

  const hostname = new URL(site.keys[0]).hostname;
  const favicon = `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;

  const handleMetricClick = (metricKey: string) => {
    if (['pageViews', 'activeUsers', 'realtimeUsers'].includes(metricKey) && metrics) {
      setSelectedMetric(metricKey);
    } else if (METRIC_DEFINITIONS[metricKey]) {
      setSelectedMetric(metricKey);
    }
  };

  return (
    <>
      <div className="bg-[#25262b]/50 rounded-lg p-2 border border-gray-800/10 hover:border-gray-700/30 
                    transition-all duration-200 mb-0.5">
        <SiteHeader
          hostname={hostname}
          favicon={favicon}
          position={site.position}
          ctr={site.ctr}
          onShowMetrics={() => setShowMetricsPopup(true)}
        />

        <MetricsGrid
          site={site}
          previousPeriodData={previousPeriodData}
          siteMetrics={siteMetrics}
          analyticsMetrics={metrics}
          onMetricClick={handleMetricClick}
        />
      </div>

      {showMetricsPopup && (
        <SiteMetricsPopup
          site={site}
          siteMetrics={siteMetrics}
          onClose={() => setShowMetricsPopup(false)}
        />
      )}

      {selectedMetric && ['pageViews', 'activeUsers', 'realtimeUsers'].includes(selectedMetric) && metrics && (
        <AnalyticsHistoryPopup
          metricKey={selectedMetric as 'pageViews' | 'activeUsers' | 'realtimeUsers'}
          analyticsMetrics={metrics}
          onClose={() => setSelectedMetric(null)}
        />
      )}

      {selectedMetric && METRIC_DEFINITIONS[selectedMetric] && !['pageViews', 'activeUsers', 'realtimeUsers'].includes(selectedMetric) && (
        <MetricHistoryPopup
          siteUrl={site.keys[0]}
          metricKey={selectedMetric}
          metricDefinition={METRIC_DEFINITIONS[selectedMetric]}
          onClose={() => setSelectedMetric(null)}
        />
      )}
    </>
  );
};