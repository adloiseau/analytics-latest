import React from 'react';
import { Globe } from 'lucide-react';
import { MetricBlock } from './MetricBlock';
import { validateUrl } from '../../utils/metrics';
import { useGoogleAnalytics } from '../../hooks/useGoogleAnalytics';
import type { SearchAnalyticsRow } from '../../services/googleAuth/types';

interface SiteMetricsRowProps {
  site: SearchAnalyticsRow;
}

export const SiteMetricsRow: React.FC<SiteMetricsRowProps> = ({ site }) => {
  if (!validateUrl(site.keys[0])) return null;

  const hostname = new URL(site.keys[0]).hostname;
  const { metrics } = useGoogleAnalytics(site.keys[0]);
  
  // Générer des données de tendance simulées
  const generateSparklineData = () => Array.from({ length: 20 }, () => Math.random() * 100);

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

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
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
        <MetricBlock
          type="users"
          value={metrics?.activeUsers || 0}
          sparklineData={generateSparklineData()}
          trend="down"
          trendValue="-2.1%"
        />
        <MetricBlock
          type="pageViews"
          value={metrics?.pageViews || 0}
          sparklineData={generateSparklineData()}
          trend="up"
          trendValue="+3.7%"
        />
        <MetricBlock
          type="duration"
          value={metrics?.avgSessionDuration || "0:00"}
          sparklineData={generateSparklineData()}
          trend="up"
          trendValue="+5.2%"
        />
        <MetricBlock
          type="bounce"
          value={`${metrics?.bounceRate || 0}%`}
          sparklineData={generateSparklineData()}
          trend="down"
          trendValue="-1.8%"
        />
      </div>
    </div>
  );
};