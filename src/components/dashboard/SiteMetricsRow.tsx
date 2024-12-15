import React from 'react';
import { Globe } from 'lucide-react';
import { MetricBlock } from './MetricBlock';
import { validateUrl } from '../../utils/metrics';
import { useGoogleAnalytics } from '../../hooks/useGoogleAnalytics';
import { IndexedPagesChart } from '../metrics/IndexedPagesChart';
import { UserMetrics } from '../metrics/UserMetrics';
import type { SearchAnalyticsRow } from '../../services/googleAuth/types';
import { useFilters } from '../../contexts/FilterContext';
import { searchConsoleApi } from '../../services/googleAuth/api';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect } from 'react';

interface SiteMetricsRowProps {
  site: SearchAnalyticsRow;
}

export const SiteMetricsRow: React.FC<SiteMetricsRowProps> = ({ site }) => {
  if (!validateUrl(site.keys[0])) return null;

  const hostname = new URL(site.keys[0]).hostname;
  const { metrics, realtimeMetrics, loading, error } = useGoogleAnalytics(site.keys[0]);
  const { dateRange } = useFilters();
  const { accessToken } = useAuth();
  const [indexedPages, setIndexedPages] = useState<{ total: number; indexed: number }>({ total: 0, indexed: 0 });
  
  useEffect(() => {
    const fetchIndexedPages = async () => {
      try {
        const response = await searchConsoleApi.fetchIndexedPages(accessToken, site.keys[0]);
        setIndexedPages(response);
      } catch (err) {
        console.error('Error fetching indexed pages:', err);
      }
    };

    if (accessToken) {
      fetchIndexedPages();
    }
  }, [accessToken, site.keys[0]]);

  const generateSparklineData = () => Array.from({ length: 20 }, () => Math.random() * 100);

  if (loading) {
    return (
      <div className="animate-pulse bg-[#25262b]/50 rounded-lg p-4 border border-gray-800/10">
        <div className="h-[160px]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#25262b]/50 rounded-lg p-4 border border-gray-800/10">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  const periodLabel = {
    '24h': 'les dernières 24h',
    '7d': 'les 7 derniers jours',
    '28d': 'les 28 derniers jours',
    '3m': 'les 3 derniers mois'
  }[dateRange];

  return (
    <div className="bg-[#25262b]/50 rounded-lg p-4 border border-gray-800/10 hover:border-gray-700/30 
                    transition-all duration-200">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <Globe className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-medium text-white truncate">{hostname}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Position</span>
          <span className="px-2 py-0.5 bg-[#1a1b1e] rounded text-sm font-medium text-white">
            {site.position.toFixed(1)}
          </span>
          <span className="text-xs text-gray-400 ml-2">CTR</span>
          <span className={`px-2 py-0.5 rounded text-sm font-medium ${
            site.ctr > 0.05 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
          }`}>
            {(site.ctr * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-3">
        {/* Search Console Metrics */}
        <div className="col-span-4">
          <div className="grid grid-cols-2 gap-3">
            <MetricBlock
              type="clicks"
              value={site.clicks}
              sparklineData={generateSparklineData()}
              trend="up"
              trendValue="+12.5%"
            />
            <MetricBlock
              type="impressions"
              value={site.impressions}
              sparklineData={generateSparklineData()}
              trend="up"
              trendValue="+8.3%"
            />
          </div>
        </div>

        {/* User Metrics */}
        <div className="col-span-6">
          <UserMetrics
            realtimeUsers={realtimeMetrics?.activeUsers || 0}
            totalUsers={metrics?.activeUsers || 0}
            pageViews={metrics?.pageViews || 0}
            period={periodLabel}
          />
        </div>

        {/* Indexed Pages Chart */}
        <div className="col-span-2">
          <div className="bg-[#1a1b1e]/50 p-3 rounded-lg h-full">
            <h4 className="text-sm text-gray-400 mb-1">Pages indexées</h4>
            <IndexedPagesChart
              totalPages={indexedPages.total}
              indexedPages={indexedPages.indexed}
            />
            <div className="text-center mt-1">
              <span className="text-xs text-gray-300">
                {indexedPages.indexed}/{indexedPages.total}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};