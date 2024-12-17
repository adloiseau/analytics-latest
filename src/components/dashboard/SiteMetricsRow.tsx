import React, { useState } from 'react';
import { validateUrl } from '../../utils/metrics';
import { useGoogleAnalytics } from '../../hooks/useGoogleAnalytics';
import { useMetrics } from '../../hooks/useMetrics';
import type { SearchAnalyticsRow } from '../../services/googleAuth/types';
import { SiteMetricsPopup } from './SiteMetricsPopup';
import { MetricHistoryPopup } from './MetricHistoryPopup';
import { METRIC_DEFINITIONS } from '../../types/metrics';
import { SiteHeader } from './site/SiteHeader';
import { MetricsGrid } from './metrics/MetricsGrid';

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
          onMetricClick={setSelectedMetric}
        />
      </div>

      {showMetricsPopup && (
        <SiteMetricsPopup
          site={site}
          siteMetrics={siteMetrics}
          onClose={() => setShowMetricsPopup(false)}
        />
      )}

      {selectedMetric && METRIC_DEFINITIONS[selectedMetric] && (
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