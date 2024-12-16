import React from 'react';
import { Globe, Users, Eye, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { MetricBlock } from './MetricBlock';
import { validateUrl, calculateTrend } from '../../utils/metrics';
import { useGoogleAnalytics } from '../../hooks/useGoogleAnalytics';
import { IndexedPagesChart } from '../metrics/IndexedPagesChart';
import type { SearchAnalyticsRow } from '../../services/googleAuth/types';
import { useFilters } from '../../contexts/FilterContext';
import { searchConsoleApi } from '../../services/googleAuth/api';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect } from 'react';

interface SiteMetricsRowProps {
  site: SearchAnalyticsRow;
  previousPeriodData?: SearchAnalyticsRow;
}

export const SiteMetricsRow: React.FC<SiteMetricsRowProps> = ({ site, previousPeriodData }) => {
  if (!validateUrl(site.keys[0])) return null;

  const hostname = new URL(site.keys[0]).hostname;
  const { metrics, realtimeMetrics, loading, error } = useGoogleAnalytics(site.keys[0]);
  const { dateRange } = useFilters();
  const { accessToken } = useAuth();
  const [indexedPages, setIndexedPages] = useState<{ total: number; indexed: number }>({ total: 0, indexed: 0 });
  const [favicon, setFavicon] = useState<string>('');
  
  useEffect(() => {
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
    setFavicon(faviconUrl);

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
  }, [accessToken, site.keys[0], hostname]);

  // Calculate trends
  const clicksTrend = previousPeriodData ? calculateTrend(site.clicks, previousPeriodData.clicks) : 0;
  const impressionsTrend = previousPeriodData ? calculateTrend(site.impressions, previousPeriodData.impressions) : 0;
  const usersTrend = metrics?.previousPeriod ? calculateTrend(metrics.activeUsers, metrics.previousPeriod.activeUsers) : 0;
  const pageViewsTrend = metrics?.previousPeriod ? calculateTrend(metrics.pageViews, metrics.previousPeriod.pageViews) : 0;

  return (
    <div className="bg-[#25262b]/50 rounded-lg p-6 border border-gray-800/10 hover:border-gray-700/30 
                    transition-all duration-300 hover:bg-[#25262b]/70 hover:shadow-xl hover:scale-[1.01] group">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          {favicon ? (
            <img src={favicon} alt={hostname} className="w-6 h-6 rounded-sm" />
          ) : (
            <Globe className="w-6 h-6 text-blue-400" />
          )}
          <h3 className="text-lg font-medium text-white truncate">{hostname}</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Position</span>
            <span className="px-2 py-1 bg-[#1a1b1e] rounded text-sm font-medium text-white">
              {site.position.toFixed(1)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">CTR</span>
            <span className={`px-2 py-1 rounded text-sm font-medium ${
              site.ctr > 0.05 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
            }`}>
              {(site.ctr * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* Search Console Metrics */}
        <div className="col-span-4 grid grid-cols-2 gap-4">
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
        </div>

        {/* User Metrics */}
        <div className="col-span-7 grid grid-cols-3 gap-4">
          <div className="bg-[#1a1b1e]/50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-400">30 dernières min</span>
            </div>
            <div className="mt-1 text-lg font-semibold text-white">
              {realtimeMetrics?.activeUsers || 0}
            </div>
          </div>

          <div className="bg-[#1a1b1e]/50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-400" />
                <span className="text-xs text-gray-400">7 derniers jours</span>
              </div>
              {usersTrend !== 0 && (
                <div className={`flex items-center ${usersTrend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {usersTrend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  <span className="text-xs">{Math.abs(usersTrend).toFixed(1)}%</span>
                </div>
              )}
            </div>
            <div className="mt-1 text-lg font-semibold text-white">
              {metrics?.activeUsers || 0}
            </div>
          </div>

          <div className="bg-[#1a1b1e]/50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-gray-400">Pages vues</span>
              </div>
              {pageViewsTrend !== 0 && (
                <div className={`flex items-center ${pageViewsTrend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {pageViewsTrend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  <span className="text-xs">{Math.abs(pageViewsTrend).toFixed(1)}%</span>
                </div>
              )}
            </div>
            <div className="mt-1 text-lg font-semibold text-white">
              {metrics?.pageViews || 0}
            </div>
          </div>
        </div>

        {/* Indexed Pages Chart */}
        <div className="col-span-1">
          <div className="bg-[#1a1b1e]/50 p-3 rounded-lg h-full group-hover:bg-[#1a1b1e]/70 transition-colors">
            <div className="flex flex-col items-center">
              <h4 className="text-xs text-gray-400 mb-1">Pages indexées</h4>
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
    </div>
  );
};