import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { MetricBlock } from './MetricBlock';
import { validateUrl, calculateTrend } from '../../utils/metrics';
import { useGoogleAnalytics } from '../../hooks/useGoogleAnalytics';
import { useMetrics } from '../../hooks/useMetrics';
import type { SearchAnalyticsRow } from '../../services/googleAuth/types';
import { SiteMetricsPopup } from './SiteMetricsPopup';

interface SiteMetricsRowProps {
  site: SearchAnalyticsRow;
  previousPeriodData?: SearchAnalyticsRow;
}

export const SiteMetricsRow: React.FC<SiteMetricsRowProps> = ({ site, previousPeriodData }) => {
  const [showPopup, setShowPopup] = useState(false);
  const { metrics, realtimeMetrics } = useGoogleAnalytics(site.keys[0]);
  const { data: siteMetrics } = useMetrics(site.keys[0]);

  if (!validateUrl(site.keys[0])) return null;

  const hostname = new URL(site.keys[0]).hostname;
  const clicksTrend = calculateTrend(site.clicks, previousPeriodData?.clicks || 0);
  const impressionsTrend = calculateTrend(site.impressions, previousPeriodData?.impressions || 0);
  const usersTrend = calculateTrend(
    metrics?.activeUsers || 0,
    metrics?.previousPeriod?.activeUsers || 0
  );

  const favicon = `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;

  return (
    <>
      <div 
        onClick={() => setShowPopup(true)}
        className="bg-[#25262b]/50 rounded-lg p-2 border border-gray-800/10 hover:border-gray-700/30 
                  transition-all duration-200 mb-0.5 cursor-pointer hover:bg-[#25262b]/70"
      >
        {/* Site Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <img 
              src={favicon} 
              alt={hostname} 
              className="w-5 h-5 rounded-sm flex-shrink-0"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = Globe;
              }}
            />
            <h3 className="text-sm font-medium text-white truncate">{hostname}</h3>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400">Pos</span>
              <span className="px-1.5 py-0.5 bg-[#1a1b1e] rounded text-sm font-medium text-white">
                {site.position.toFixed(1)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400">CTR</span>
              <span className={`px-1.5 py-0.5 rounded text-sm font-medium ${
                site.ctr > 0.05 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
              }`}>
                {(site.ctr * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-5 gap-0.5">
          {/* Trafic Organique */}
          <div className="w-full">
            <MetricBlock
              type="custom"
              label="Trafic organique"
              value={siteMetrics?.TO?.value || 0}
              trend={siteMetrics?.TO?.trend || 0}
              color="#3b82f6"
            />
          </div>

          {/* Search Console Metrics */}
          <div className="w-full">
            <MetricBlock
              type="clicks"
              value={site.clicks}
              trend={clicksTrend}
              label="Nombre de clics"
              color="#10b981"
            />
          </div>
          <div className="w-full">
            <MetricBlock
              type="impressions"
              value={site.impressions}
              trend={impressionsTrend}
              label="Impressions"
              color="#8b5cf6"
            />
          </div>

          {/* Google Analytics Metrics */}
          <div className="w-full">
            <MetricBlock
              type="custom"
              label="Visiteurs 30m"
              value={realtimeMetrics?.activeUsers || 0}
              color="#f59e0b"
            />
          </div>
          <div className="w-full">
            <MetricBlock
              type="custom"
              label="Visiteurs 7j"
              value={metrics?.activeUsers || 0}
              trend={usersTrend}
              color="#ec4899"
            />
          </div>
        </div>
      </div>

      {/* Metrics Popup */}
      {showPopup && (
        <SiteMetricsPopup
          site={site}
          siteMetrics={siteMetrics}
          onClose={() => setShowPopup(false)}
        />
      )}
    </>
  );
};