import React from 'react';
import { Globe } from 'lucide-react';
import { MetricBlock } from './MetricBlock';
import { validateUrl, calculateTrend } from '../../utils/metrics';
import { useGoogleAnalytics } from '../../hooks/useGoogleAnalytics';
import { useMetrics } from '../../hooks/useMetrics';
import { METRIC_DEFINITIONS } from '../../types/metrics';
import type { SearchAnalyticsRow } from '../../services/googleAuth/types';

interface SiteMetricsRowProps {
  site: SearchAnalyticsRow;
  previousPeriodData?: SearchAnalyticsRow;
}

export const SiteMetricsRow: React.FC<SiteMetricsRowProps> = ({ site, previousPeriodData }) => {
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

  // Get site favicon
  const favicon = `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;

  return (
    <div className="bg-[#25262b]/50 rounded-lg p-3 border border-gray-800/10 hover:border-gray-700/30 
                    transition-all duration-200">
      {/* Site Header */}
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          <img 
            src={favicon} 
            alt={hostname} 
            className="w-4 h-4 rounded-sm"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = Globe;
            }}
          />
          <h3 className="text-base font-medium text-white truncate">{hostname}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Pos</span>
          <span className="px-2 py-0.5 bg-[#1a1b1e] rounded text-sm font-medium text-white">
            {site.position.toFixed(1)}
          </span>
          <span className="text-xs text-gray-400">CTR</span>
          <span className={`px-2 py-0.5 rounded text-sm font-medium ${
            site.ctr > 0.05 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
          }`}>
            {(site.ctr * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* All Metrics in One Row */}
      <div className="grid grid-cols-12 gap-2">
        {/* Search Console Metrics */}
        <div className="col-span-1">
          <MetricBlock
            type="clicks"
            value={site.clicks}
            trend={clicksTrend}
            label="CLC"
            tooltip="Nombre de clics"
          />
        </div>
        <div className="col-span-1">
          <MetricBlock
            type="impressions"
            value={site.impressions}
            trend={impressionsTrend}
            label="IMP"
            tooltip="Nombre d'impressions"
          />
        </div>

        {/* Google Analytics Metrics */}
        <div className="col-span-1">
          <MetricBlock
            type="custom"
            label="30m"
            value={realtimeMetrics?.activeUsers || 0}
            color="#10b981"
            tooltip="Visiteurs sur les 30 dernières minutes"
          />
        </div>
        <div className="col-span-1">
          <MetricBlock
            type="custom"
            label="7J"
            value={metrics?.activeUsers || 0}
            trend={usersTrend}
            color="#6366f1"
            tooltip="Visiteurs sur 7 jours"
          />
        </div>

        {/* Supabase Metrics */}
        {siteMetrics && Object.entries(METRIC_DEFINITIONS).map(([key, definition]) => (
          <div key={key} className="col-span-1">
            <MetricBlock
              type="custom"
              label={key}
              value={siteMetrics[key]?.value || 0}
              trend={siteMetrics[key]?.trend || 0}
              color={definition.color}
              tooltip={definition.description}
            />
          </div>
        ))}
      </div>
    </div>
  );
};