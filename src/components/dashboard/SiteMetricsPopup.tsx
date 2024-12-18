import React, { useState } from 'react';
import { X } from 'lucide-react';
import { MetricBlock } from './MetricBlock';
import { METRIC_DEFINITIONS } from '../../types/metrics';
import { MetricHistoryPopup } from './MetricHistoryPopup';
import { AnalyticsHistoryPopup } from './AnalyticsHistoryPopup';
import { useFilters } from '../../contexts/FilterContext';

interface SiteMetricsPopupProps {
  site: SearchAnalyticsRow;
  siteMetrics: any;
  analyticsMetrics: any;
  onClose: () => void;
}

export const SiteMetricsPopup: React.FC<SiteMetricsPopupProps> = ({
  site,
  siteMetrics,
  analyticsMetrics,
  onClose
}) => {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const { dateRange } = useFilters();

  // Filter out metrics that are already shown in the main view
  const additionalMetrics = Object.entries(METRIC_DEFINITIONS).filter(
    ([key]) => ['AS', 'BL', 'RD', 'VI', 'TF', 'CF', 'pageViews'].includes(key)
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-[#25262b] rounded-lg p-6 w-[90vw] max-w-4xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg hover:bg-[#1a1b1e] text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-lg font-semibold text-white mb-1">
            Métriques additionnelles
          </h2>
          <p className="text-sm text-gray-400 mb-6">{new URL(site.keys[0]).hostname}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {additionalMetrics.map(([key, definition]) => {
              const value = key === 'pageViews' 
                ? analyticsMetrics?.pageViews 
                : siteMetrics?.[key]?.value;

              const historicalData = key === 'pageViews'
                ? analyticsMetrics?.pageViewsHistory
                : undefined;

              return (
                <div 
                  key={key} 
                  className="w-full cursor-pointer hover:scale-[1.02] transition-transform"
                  onClick={() => setSelectedMetric(key)}
                >
                  <MetricBlock
                    type="custom"
                    label={definition.label}
                    value={value || 0}
                    color={definition.color}
                    tooltip={definition.description}
                    historicalData={historicalData}
                    isGAMetric={key === 'pageViews'}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {selectedMetric === 'pageViews' && analyticsMetrics && (
        <AnalyticsHistoryPopup
          metricKey="pageViews"
          analyticsMetrics={analyticsMetrics}
          onClose={() => setSelectedMetric(null)}
        />
      )}

      {selectedMetric && selectedMetric !== 'pageViews' && METRIC_DEFINITIONS[selectedMetric] && (
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