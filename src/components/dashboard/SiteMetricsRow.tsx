import React, { useState, useEffect } from 'react';
import { Globe, Users, Eye, Clock, ArrowUpRight, ArrowDownRight, Search as SearchIcon, BarChart3 } from 'lucide-react';
import { MetricBlock } from './MetricBlock';
import { validateUrl, calculateTrend } from '../../utils/metrics';
import { useGoogleAnalytics } from '../../hooks/useGoogleAnalytics';
import { IndexedPagesChart } from '../metrics/IndexedPagesChart';
import type { SearchAnalyticsRow } from '../../services/googleAuth/types';
import { useFilters } from '../../contexts/FilterContext';
import { searchConsoleApi } from '../../services/googleAuth/api';
import { useAuth } from '../../contexts/AuthContext';

interface SiteMetricsRowProps {
  site: SearchAnalyticsRow;
  previousPeriodData?: SearchAnalyticsRow;
}

export const SiteMetricsRow: React.FC<SiteMetricsRowProps> = ({ site, previousPeriodData }) => {
  const { accessToken } = useAuth();
  const [indexedPages, setIndexedPages] = useState({ total: 100, indexed: 80 });
  const { metrics, realtimeMetrics } = useGoogleAnalytics(site.keys[0]);

  useEffect(() => {
    if (accessToken && validateUrl(site.keys[0])) {
      searchConsoleApi.fetchIndexedPages(accessToken, site.keys[0])
        .then(setIndexedPages)
        .catch(console.error);
    }
  }, [accessToken, site.keys[0]]);

  if (!validateUrl(site.keys[0])) return null;

  const hostname = new URL(site.keys[0]).hostname;
  const clicksTrend = calculateTrend(site.clicks, previousPeriodData?.clicks || 0);
  const impressionsTrend = calculateTrend(site.impressions, previousPeriodData?.impressions || 0);
  const usersTrend = calculateTrend(
    metrics?.activeUsers || 0,
    metrics?.previousPeriod?.activeUsers || 0
  );
  const pageViewsTrend = calculateTrend(
    metrics?.pageViews || 0,
    metrics?.previousPeriod?.pageViews || 0
  );

  return (
    <div className="bg-[#25262b]/50 rounded-lg p-4 border border-gray-800/10 hover:border-gray-700/30 
                    transition-all duration-200">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <Globe className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-medium text-white truncate">{hostname}</h3>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-400">Position</span>
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

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <MetricBlock
          type="clicks"
          value={site.clicks}
          trend={clicksTrend}
          trendValue={`${clicksTrend > 0 ? '+' : ''}${clicksTrend.toFixed(1)}%`}
        />
        <MetricBlock
          type="impressions"
          value={site.impressions}
          trend={impressionsTrend}
          trendValue={`${impressionsTrend > 0 ? '+' : ''}${impressionsTrend.toFixed(1)}%`}
        />
        <MetricBlock
          type="users"
          value={realtimeMetrics?.activeUsers || 0}
          label="30 dernières min"
        />
        <MetricBlock
          type="users"
          value={metrics?.activeUsers || 0}
          trend={usersTrend}
          trendValue={`${usersTrend > 0 ? '+' : ''}${usersTrend.toFixed(1)}%`}
          label="7 derniers jours"
        />
        <MetricBlock
          type="pageViews"
          value={metrics?.pageViews || 0}
          trend={pageViewsTrend}
          trendValue={`${pageViewsTrend > 0 ? '+' : ''}${pageViewsTrend.toFixed(1)}%`}
        />
        <div className="flex items-center justify-between bg-[#1a1b1e]/50 rounded-lg p-3 border border-gray-800/10">
          <div className="flex items-center gap-2">
            <IndexedPagesChart 
              totalPages={indexedPages.total} 
              indexedPages={indexedPages.indexed} 
            />
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">Pages indexées</span>
              <span className="text-sm font-medium text-white">
                {indexedPages.indexed}/{indexedPages.total}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};